# Releasing the CKMark Android app

CKMark release APKs are built, signed and published by `.github/workflows/release-android-apk.yml`.

## One-time signing setup

Android requires every update to use the same private signing key. Keep the keystore and its passwords backed up securely. Losing them means future versions cannot update an installed release build.

Generate a keystore on Windows with the JDK `keytool` command:

```powershell
keytool -genkeypair -v `
  -keystore sciencemd-release.jks `
  -alias sciencemd `
  -keyalg RSA `
  -keysize 4096 `
  -validity 10000
```

Convert it to a single Base64 value:

```powershell
[Convert]::ToBase64String(
  [IO.File]::ReadAllBytes("sciencemd-release.jks")
) | Set-Content -NoNewline "sciencemd-release.jks.b64"
```

In the GitHub repository, open **Settings → Secrets and variables → Actions** and add these repository secrets:

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Complete contents of `sciencemd-release.jks.b64` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | `sciencemd`, unless a different alias was chosen |
| `ANDROID_KEY_PASSWORD` | Private-key password |

Never commit the `.jks` file, its Base64 form or its passwords to the repository.

## Publishing a release

1. Open **Actions → Release Android APK → Run workflow**.
2. Enter a semantic version such as `1.2.0`.
3. Enter a version code larger than every previous release, such as `3`.
4. Choose whether the release is a pre-release.
5. Run the workflow.

The workflow performs the repository smoke checks, Android release lint, a signed release build, APK signature verification and SHA-256 generation. It then publishes a GitHub Release containing:

- `CKMark-v<version>.apk`
- `CKMark-v<version>.apk.sha256`

## Debug and release installations

Debug builds use the package suffix `.debug`, so they can coexist with the signed release app. Older test APKs created before this separation used the release package name with Android's debug signing key. Such an older APK must be uninstalled once before installing the first properly signed release.

## Versioning

The defaults live in `android/app/build.gradle`. The release workflow overrides them using:

- `SCIENCEMD_VERSION_NAME`
- `SCIENCEMD_VERSION_CODE`

Always increase the version code. Release names should use the `major.minor.patch` form.
