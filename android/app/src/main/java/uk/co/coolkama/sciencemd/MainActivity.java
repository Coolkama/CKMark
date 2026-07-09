package uk.co.coolkama.sciencemd;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.os.ParcelFileDescriptor;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public final class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST_CODE = 1001;
    private static final int SAVE_DOCUMENT_REQUEST_CODE = 1002;

    private WebView webView;
    private ValueCallback<Uri[]> pendingFileSelection;
    private Uri pendingIncomingDocument;
    private boolean pageReady;

    private Uri currentDocumentUri;
    private String currentDocumentName;
    private boolean currentDocumentWritable;

    private ByteArrayOutputStream incomingSaveBuffer;
    private String incomingSaveName;
    private String incomingSaveMimeType;
    private boolean incomingSaveAs;

    private byte[] pendingSaveBytes;
    private String pendingSaveName;
    private String pendingSaveMimeType;
    private boolean pendingSaveShouldBecomeCurrent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        captureIncomingDocument(getIntent());

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("file".equalsIgnoreCase(uri.getScheme())) {
                    return false;
                }

                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (ActivityNotFoundException exception) {
                    Toast.makeText(MainActivity.this, "No application can open this link.", Toast.LENGTH_SHORT).show();
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                pageReady = true;
                view.evaluateJavascript(
                    "window.print = function () { AndroidBridge.printPage(); };",
                    null
                );
                installAndroidSaveHook();
                openPendingIncomingDocument();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(
                WebView view,
                ValueCallback<Uri[]> filePathCallback,
                FileChooserParams fileChooserParams
            ) {
                if (pendingFileSelection != null) {
                    pendingFileSelection.onReceiveValue(null);
                }
                pendingFileSelection = filePathCallback;

                Intent pickerIntent = createFilePickerIntent(fileChooserParams);

                try {
                    startActivityForResult(pickerIntent, FILE_CHOOSER_REQUEST_CODE);
                    return true;
                } catch (ActivityNotFoundException exception) {
                    pendingFileSelection = null;
                    Toast.makeText(MainActivity.this, "No file picker is available.", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        if (savedInstanceState == null) {
            webView.loadUrl("file:///android_asset/index.html");
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void installAndroidSaveHook() {
        String script =
            "(function(){" +
            "if(window.__scienceMdAndroidSaveHook){return;}" +
            "window.__scienceMdAndroidSaveHook=true;" +
            "var pendingUrls=new Set();" +
            "var nextSaveAs=false;" +
            "document.addEventListener('click',function(event){" +
            "var target=event.target&&event.target.closest?event.target.closest('button,[role=\"button\"],a'):null;" +
            "if(!target){return;}" +
            "var label=((target.getAttribute('aria-label')||'')+' '+(target.getAttribute('title')||'')+' '+(target.textContent||'')).trim().toLowerCase().replace(/\\s+/g,' ');" +
            "if(label.indexOf('save as')!==-1){nextSaveAs=true;}" +
            "else if(label==='save'||label.indexOf('save current')!==-1){nextSaveAs=false;}" +
            "if(label==='new'||label.indexOf('new document')!==-1||label.indexOf('start a fresh')!==-1){AndroidBridge.clearCurrentDocument();}" +
            "},true);" +
            "var originalRevoke=URL.revokeObjectURL.bind(URL);" +
            "URL.revokeObjectURL=function(url){" +
            "if(pendingUrls.has(url)){return;}" +
            "originalRevoke(url);" +
            "};" +
            "var originalClick=HTMLAnchorElement.prototype.click;" +
            "HTMLAnchorElement.prototype.click=function(){" +
            "var href=this.href||'';" +
            "var isDownload=this.hasAttribute('download');" +
            "if(isDownload&&(href.indexOf('blob:')===0||href.indexOf('data:')===0)){" +
            "var fileName=this.getAttribute('download')||'Sciwrix.md';" +
            "var forceSaveAs=nextSaveAs;" +
            "nextSaveAs=false;" +
            "pendingUrls.add(href);" +
            "fetch(href).then(function(response){return response.blob();}).then(function(blob){" +
            "return blob.arrayBuffer().then(function(buffer){return {blob:blob,buffer:buffer};});" +
            "}).then(function(result){" +
            "AndroidBridge.beginFileSave(fileName,result.blob.type||'application/octet-stream',forceSaveAs);" +
            "var bytes=new Uint8Array(result.buffer);" +
            "var chunkSize=24576;" +
            "for(var offset=0;offset<bytes.length;offset+=chunkSize){" +
            "var slice=bytes.subarray(offset,Math.min(offset+chunkSize,bytes.length));" +
            "var binary='';" +
            "for(var i=0;i<slice.length;i++){binary+=String.fromCharCode(slice[i]);}" +
            "AndroidBridge.appendFileSaveChunk(btoa(binary));" +
            "}" +
            "AndroidBridge.completeFileSave();" +
            "}).catch(function(error){AndroidBridge.fileSaveFailed(String(error));}).finally(function(){" +
            "pendingUrls.delete(href);" +
            "originalRevoke(href);" +
            "});" +
            "return;" +
            "}" +
            "return originalClick.apply(this,arguments);" +
            "};" +
            "})();";

        webView.evaluateJavascript(script, null);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        captureIncomingDocument(intent);
        openPendingIncomingDocument();
    }

    private void captureIncomingDocument(Intent intent) {
        if (intent == null) {
            return;
        }

        String action = intent.getAction();
        if (!Intent.ACTION_VIEW.equals(action) && !Intent.ACTION_EDIT.equals(action)) {
            return;
        }

        Uri uri = intent.getData();
        if (uri != null) {
            rememberCurrentDocument(uri, resolveDisplayName(uri), intent.getFlags());
            pendingIncomingDocument = uri;
        }
    }

    private void rememberCurrentDocument(Uri uri, String fileName, int flags) {
        if (uri == null) {
            clearCurrentDocument();
            return;
        }

        takePersistableDocumentPermission(uri, flags);
        currentDocumentUri = uri;
        currentDocumentName = fileName;
        currentDocumentWritable =
            (flags & Intent.FLAG_GRANT_WRITE_URI_PERMISSION) != 0 || canWriteDocument(uri);
    }

    private void takePersistableDocumentPermission(Uri uri, int flags) {
        if (!"content".equalsIgnoreCase(uri.getScheme())) {
            return;
        }
        if ((flags & Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION) == 0) {
            return;
        }

        int takeFlags = flags & (
            Intent.FLAG_GRANT_READ_URI_PERMISSION |
            Intent.FLAG_GRANT_WRITE_URI_PERMISSION
        );
        if (takeFlags == 0) {
            return;
        }

        try {
            getContentResolver().takePersistableUriPermission(uri, takeFlags);
        } catch (SecurityException ignored) {
            // Some providers advertise persistence but do not allow it for every document.
        }
    }

    private boolean canWriteDocument(Uri uri) {
        if (uri == null) {
            return false;
        }

        try (ParcelFileDescriptor descriptor = getContentResolver().openFileDescriptor(uri, "rw")) {
            return descriptor != null;
        } catch (Exception ignored) {
            return false;
        }
    }

    private void clearCurrentDocument() {
        currentDocumentUri = null;
        currentDocumentName = null;
        currentDocumentWritable = false;
    }

    private void openPendingIncomingDocument() {
        if (!pageReady || pendingIncomingDocument == null) {
            return;
        }

        Uri uri = pendingIncomingDocument;
        pendingIncomingDocument = null;

        new Thread(() -> {
            try {
                byte[] contents = readAllBytes(uri);
                String fileName = resolveDisplayName(uri);
                String mimeType = getContentResolver().getType(uri);
                if (mimeType == null || mimeType.trim().isEmpty()) {
                    mimeType = "text/markdown";
                }

                String finalMimeType = mimeType;
                runOnUiThread(() -> injectMarkdownFile(contents, fileName, finalMimeType));
            } catch (Exception exception) {
                runOnUiThread(() -> Toast.makeText(
                    MainActivity.this,
                    "Sciwrix could not open this Markdown file.",
                    Toast.LENGTH_LONG
                ).show());
            }
        }).start();
    }

    private byte[] readAllBytes(Uri uri) throws IOException {
        try (
            InputStream input = getContentResolver().openInputStream(uri);
            ByteArrayOutputStream output = new ByteArrayOutputStream()
        ) {
            if (input == null) {
                throw new IOException("The selected document could not be read.");
            }

            byte[] buffer = new byte[8192];
            int read;
            while ((read = input.read(buffer)) != -1) {
                output.write(buffer, 0, read);
            }
            return output.toByteArray();
        }
    }

    private String resolveDisplayName(Uri uri) {
        String fileName = null;

        try (Cursor cursor = getContentResolver().query(
            uri,
            new String[] { OpenableColumns.DISPLAY_NAME },
            null,
            null,
            null
        )) {
            if (cursor != null && cursor.moveToFirst()) {
                int nameColumn = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (nameColumn >= 0) {
                    fileName = cursor.getString(nameColumn);
                }
            }
        } catch (Exception ignored) {
            // Fall back to the URI path below.
        }

        if (fileName == null || fileName.trim().isEmpty()) {
            fileName = uri.getLastPathSegment();
        }
        if (fileName == null || fileName.trim().isEmpty()) {
            fileName = "document.md";
        }

        return fileName;
    }

    private void injectMarkdownFile(byte[] contents, String fileName, String mimeType) {
        String encodedContents = Base64.encodeToString(contents, Base64.NO_WRAP);

        String script =
            "(function(){try{" +
            "var binary=atob(" + JSONObject.quote(encodedContents) + ");" +
            "var bytes=new Uint8Array(binary.length);" +
            "for(var i=0;i<binary.length;i++){bytes[i]=binary.charCodeAt(i);}" +
            "var file=new File([bytes]," + JSONObject.quote(fileName) + ",{type:" + JSONObject.quote(mimeType) + "});" +
            "var inputs=Array.prototype.slice.call(document.querySelectorAll('input[type=\"file\"]'));" +
            "var input=inputs.find(function(element){" +
            "var accept=(element.getAttribute('accept')||'').toLowerCase();" +
            "return accept.indexOf('image/')===-1&&(accept.indexOf('.md')!==-1||accept.indexOf('markdown')!==-1||accept.indexOf('text/plain')!==-1);" +
            "});" +
            "if(!input){input=inputs.find(function(element){return (element.getAttribute('accept')||'').toLowerCase().indexOf('image/')===-1;});}" +
            "if(!input){return 'no-input';}" +
            "var transfer=new DataTransfer();" +
            "transfer.items.add(file);" +
            "input.files=transfer.files;" +
            "input.dispatchEvent(new Event('change',{bubbles:true}));" +
            "return 'ok';" +
            "}catch(error){return 'error:'+error.message;}})();";

        webView.evaluateJavascript(script, result -> {
            if (result == null || result.contains("no-input") || result.contains("error:")) {
                Toast.makeText(
                    MainActivity.this,
                    "Sciwrix could not pass this file to the editor.",
                    Toast.LENGTH_LONG
                ).show();
                return;
            }

            Toast.makeText(
                MainActivity.this,
                "Opened " + fileName,
                Toast.LENGTH_SHORT
            ).show();
        });
    }

    private Intent createFilePickerIntent(WebChromeClient.FileChooserParams fileChooserParams) {
        if (isImageChooser(fileChooserParams.getAcceptTypes())) {
            return fileChooserParams.createIntent();
        }

        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.addFlags(
            Intent.FLAG_GRANT_READ_URI_PERMISSION |
            Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
            Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
        );
        intent.setType("*/*");
        intent.putExtra(
            Intent.EXTRA_MIME_TYPES,
            new String[] {
                "text/markdown",
                "text/x-markdown",
                "text/plain",
                "application/octet-stream"
            }
        );
        intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, false);

        return Intent.createChooser(intent, "Open Markdown file");
    }

    private boolean isImageChooser(String[] acceptTypes) {
        if (acceptTypes == null) {
            return false;
        }

        for (String acceptType : acceptTypes) {
            if (acceptType != null && acceptType.startsWith("image/")) {
                return true;
            }
        }

        return false;
    }

    private boolean isMarkdownSave(String fileName, String mimeType) {
        String lowerName = fileName == null ? "" : fileName.toLowerCase();
        String lowerType = mimeType == null ? "" : mimeType.toLowerCase();
        return
            lowerName.endsWith(".md") ||
            lowerName.endsWith(".markdown") ||
            lowerType.contains("markdown") ||
            "text/plain".equals(lowerType);
    }

    private void handlePreparedSave(
        byte[] bytes,
        String fileName,
        String mimeType,
        boolean forceSaveAs
    ) {
        String safeName = sanitiseFileName(fileName);
        boolean markdownSave = isMarkdownSave(safeName, mimeType);

        if (
            !forceSaveAs &&
            markdownSave &&
            currentDocumentUri != null &&
            currentDocumentWritable
        ) {
            writeSavedDocument(
                currentDocumentUri,
                bytes,
                currentDocumentName == null ? safeName : currentDocumentName,
                mimeType,
                true,
                true
            );
            return;
        }

        requestSaveDocument(bytes, safeName, mimeType, markdownSave);
    }

    private void requestSaveDocument(
        byte[] bytes,
        String fileName,
        String mimeType,
        boolean shouldBecomeCurrent
    ) {
        pendingSaveBytes = bytes;
        pendingSaveName = sanitiseFileName(fileName);
        pendingSaveMimeType = mimeType;
        pendingSaveShouldBecomeCurrent = shouldBecomeCurrent;

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.addFlags(
            Intent.FLAG_GRANT_READ_URI_PERMISSION |
            Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
            Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
        );
        intent.setType(
            mimeType == null || mimeType.trim().isEmpty()
                ? "application/octet-stream"
                : mimeType
        );
        intent.putExtra(Intent.EXTRA_TITLE, pendingSaveName);

        try {
            startActivityForResult(intent, SAVE_DOCUMENT_REQUEST_CODE);
        } catch (ActivityNotFoundException exception) {
            clearPendingSave();
            Toast.makeText(this, "No save location picker is available.", Toast.LENGTH_LONG).show();
        }
    }

    private String sanitiseFileName(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return "Sciwrix.md";
        }

        String cleaned = fileName.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        return cleaned.isEmpty() ? "Sciwrix.md" : cleaned;
    }

    private void clearPendingSave() {
        pendingSaveBytes = null;
        pendingSaveName = null;
        pendingSaveMimeType = null;
        pendingSaveShouldBecomeCurrent = false;
    }

    private OutputStream openWritableStream(Uri uri) throws IOException {
        OutputStream output = getContentResolver().openOutputStream(uri, "wt");
        if (output == null) {
            output = getContentResolver().openOutputStream(uri, "w");
        }
        if (output == null) {
            throw new IOException("The selected save location could not be opened.");
        }
        return output;
    }

    private void writeSavedDocument(
        Uri uri,
        byte[] bytes,
        String fileName,
        String mimeType,
        boolean establishCurrent,
        boolean fallbackToSaveAs
    ) {
        new Thread(() -> {
            try (OutputStream output = openWritableStream(uri)) {
                output.write(bytes);
                output.flush();

                if (establishCurrent) {
                    runOnUiThread(() -> {
                        currentDocumentUri = uri;
                        currentDocumentName = fileName;
                        currentDocumentWritable = true;
                    });
                }

                runOnUiThread(() -> Toast.makeText(
                    MainActivity.this,
                    "Saved " + fileName,
                    Toast.LENGTH_SHORT
                ).show());
            } catch (Exception exception) {
                if (fallbackToSaveAs) {
                    currentDocumentWritable = false;
                    runOnUiThread(() -> requestSaveDocument(
                        bytes,
                        fileName,
                        mimeType,
                        establishCurrent
                    ));
                    return;
                }

                runOnUiThread(() -> Toast.makeText(
                    MainActivity.this,
                    "Sciwrix could not save this file.",
                    Toast.LENGTH_LONG
                ).show());
            }
        }).start();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == SAVE_DOCUMENT_REQUEST_CODE) {
            byte[] bytes = pendingSaveBytes;
            String fileName = pendingSaveName;
            String mimeType = pendingSaveMimeType;
            boolean shouldBecomeCurrent = pendingSaveShouldBecomeCurrent;
            clearPendingSave();

            if (
                resultCode == RESULT_OK &&
                data != null &&
                data.getData() != null &&
                bytes != null
            ) {
                Uri uri = data.getData();
                takePersistableDocumentPermission(uri, data.getFlags());
                writeSavedDocument(
                    uri,
                    bytes,
                    fileName == null ? "Sciwrix.md" : fileName,
                    mimeType,
                    shouldBecomeCurrent,
                    false
                );
            }
            return;
        }

        if (requestCode != FILE_CHOOSER_REQUEST_CODE || pendingFileSelection == null) {
            return;
        }

        Uri[] result = resultCode == RESULT_OK
            ? WebChromeClient.FileChooserParams.parseResult(resultCode, data)
            : null;

        if (
            resultCode == RESULT_OK &&
            data != null &&
            data.getData() != null
        ) {
            Uri uri = data.getData();
            rememberCurrentDocument(uri, resolveDisplayName(uri), data.getFlags());
        }

        pendingFileSelection.onReceiveValue(result);
        pendingFileSelection = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private void printScienceMdDocument() {
        PrintManager printManager = (PrintManager) getSystemService(PRINT_SERVICE);
        PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter("Sciwrix document");
        printManager.print(
            "Sciwrix document",
            adapter,
            new PrintAttributes.Builder().build()
        );
    }

    private final class AndroidBridge {
        @JavascriptInterface
        public void printPage() {
            runOnUiThread(MainActivity.this::printScienceMdDocument);
        }

        @JavascriptInterface
        public void clearCurrentDocument() {
            runOnUiThread(MainActivity.this::clearCurrentDocument);
        }

        @JavascriptInterface
        public synchronized void beginFileSave(
            String fileName,
            String mimeType,
            boolean forceSaveAs
        ) {
            incomingSaveBuffer = new ByteArrayOutputStream();
            incomingSaveName = fileName;
            incomingSaveMimeType = mimeType;
            incomingSaveAs = forceSaveAs;
        }

        @JavascriptInterface
        public synchronized void appendFileSaveChunk(String base64Chunk) {
            if (incomingSaveBuffer == null) {
                return;
            }

            byte[] decoded = Base64.decode(base64Chunk, Base64.DEFAULT);
            incomingSaveBuffer.write(decoded, 0, decoded.length);
        }

        @JavascriptInterface
        public void completeFileSave() {
            byte[] bytes;
            String fileName;
            String mimeType;
            boolean forceSaveAs;

            synchronized (this) {
                if (incomingSaveBuffer == null) {
                    return;
                }

                bytes = incomingSaveBuffer.toByteArray();
                fileName = incomingSaveName;
                mimeType = incomingSaveMimeType;
                forceSaveAs = incomingSaveAs;
                incomingSaveBuffer = null;
                incomingSaveName = null;
                incomingSaveMimeType = null;
                incomingSaveAs = false;
            }

            runOnUiThread(() -> handlePreparedSave(
                bytes,
                fileName,
                mimeType,
                forceSaveAs
            ));
        }

        @JavascriptInterface
        public synchronized void fileSaveFailed(String message) {
            incomingSaveBuffer = null;
            incomingSaveName = null;
            incomingSaveMimeType = null;
            incomingSaveAs = false;
            runOnUiThread(() -> Toast.makeText(
                MainActivity.this,
                "Sciwrix could not prepare this file for saving.",
                Toast.LENGTH_LONG
            ).show());
        }
    }
}
