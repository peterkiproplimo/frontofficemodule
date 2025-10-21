# Google Drive Integration for Student Project Evidence

This document provides complete setup instructions for the Google Drive integration in your MERN admin system.

## 🎉 Features Implemented

### Backend Features
- ✅ Google Drive service utility for file uploads
- ✅ Automatic folder structure creation (Student Projects/Year/Month/StudentName_ProjectTitle)
- ✅ Integration with existing project evidence controller
- ✅ Support for uploading existing projects to Google Drive
- ✅ File deletion from Google Drive when project evidence is deleted
- ✅ Google Drive file information retrieval

### Frontend Features
- ✅ Google Drive service for API communication
- ✅ Upload to Google Drive checkbox in submission form
- ✅ Upload button for existing projects
- ✅ View/Download buttons for Google Drive files
- ✅ Google Drive status indicators in project list
- ✅ Google Drive information in project details modal

## 📁 Files Created/Modified

### Backend Files
- `server/config/@credentials.json` - Google API credentials template
- `server/utils/googleDriveService.js` - Google Drive service utility
- `server/controllers/projectEvidenceController.js` - Updated with Google Drive integration
- `server/models/ProjectEvidence.js` - Added Google Drive data fields
- `server/routes/projectEvidenceRoutes.js` - Added Google Drive endpoints

### Frontend Files
- `elimurise1/src/services/googleDriveService.ts` - Frontend Google Drive service
- `elimurise1/src/pages/Projects/ProjectsModule/index.tsx` - Updated with Google Drive UI

## 🔧 Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `student-projects-drive-service`
   - Description: `Service account for student project evidence uploads`
4. Click "Create and Continue"
5. Skip role assignment for now (click "Continue")
6. Click "Done"

### 3. Generate Service Account Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to "Keys" tab
4. Click "Add Key" > "Create new key"
5. Select "JSON" format
6. Download the JSON file

### 4. Configure Credentials

1. Copy the downloaded JSON file to `server/config/@credentials.json`
2. Replace the template content with your actual credentials
3. The file should look like this:
```json
{
  "type": "service_account",
  "project_id": "your-actual-project-id",
  "private_key_id": "your-actual-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-actual-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project-id.iam.gserviceaccount.com"
}
```

### 5. Create Google Drive Folder (Optional)

1. Create a folder in your Google Drive called "Student Projects"
2. Share this folder with your service account email:
   - Right-click the folder > "Share"
   - Add the service account email (found in your credentials file)
   - Give it "Editor" permissions
3. Note: The service will create subfolders automatically

### 6. Install Dependencies

The Google APIs dependency is already installed:
```bash
cd server
npm install googleapis
```

### 7. Environment Variables

Add these to your `.env` file if needed:
```env
GOOGLE_DRIVE_ENABLED=true
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-if-you-want-to-specify-a-parent-folder
```

## 🚀 Usage

### For Students (Frontend)

1. **Submit New Project Evidence:**
   - Go to Projects > Submit Evidence
   - Fill in project details
   - Upload media file
   - Check "Upload to Google Drive" checkbox
   - Submit

2. **Upload Existing Project:**
   - Go to Projects > Project List
   - Find your project
   - Click the upload button (📤) in the Actions column
   - Wait for upload to complete

3. **View Google Drive Files:**
   - Projects uploaded to Google Drive show a green external link button (🔗)
   - Click to view the file in Google Drive
   - In project details modal, you can view/download files

### For Teachers/Admins

1. **Review Projects:**
   - All projects show Google Drive status
   - Click "View" to see project details
   - Google Drive section shows folder structure and links

## 📂 Folder Structure

The system automatically creates this folder structure in Google Drive:

```
Student Projects/
├── 2024/
│   ├── 2024-01/
│   │   ├── John_Doe_My_Project_Title/
│   │   │   └── project-file.jpg
│   │   └── Jane_Smith_Another_Project/
│   │       └── project-video.mp4
│   └── 2024-02/
│       └── ...
└── 2025/
    └── ...
```

## 🔗 API Endpoints

### New Endpoints Added

```
POST /api/project-evidences/:id/upload-to-drive
- Upload existing project evidence to Google Drive

GET /api/project-evidences/:id/google-drive-info
- Get Google Drive file information
```

### Updated Endpoints

```
POST /api/project-evidences
- Now accepts uploadToGoogleDrive parameter
- Returns Google Drive data if uploaded

DELETE /api/project-evidences/:id
- Now deletes files from Google Drive if they exist
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Credentials file not found"**
   - Ensure `server/config/@credentials.json` exists
   - Check file permissions

2. **"Permission denied"**
   - Verify service account has Drive API access
   - Check if folder is shared with service account

3. **"File not found"**
   - Ensure local file exists before uploading to Drive
   - Check file path permissions

4. **"API quota exceeded"**
   - Google Drive API has daily limits
   - Consider implementing rate limiting

### Debug Mode

Enable debug logging by adding to your server:
```javascript
// In server/utils/googleDriveService.js
console.log('Debug: Google Drive service initialized');
```

## 🔒 Security Notes

1. **Credentials Security:**
   - Never commit credentials to version control
   - Use environment variables for production
   - Rotate service account keys regularly

2. **Access Control:**
   - Service account should have minimal required permissions
   - Consider using Google Workspace domain restrictions

3. **Data Privacy:**
   - Student data is stored in Google Drive
   - Ensure compliance with data protection regulations
   - Consider data retention policies

## 📈 Future Enhancements

- [ ] Bulk upload multiple projects
- [ ] Google Drive folder sharing with students
- [ ] Integration with Google Classroom
- [ ] Advanced search within Google Drive
- [ ] Automatic backup of local files
- [ ] Google Drive storage quota monitoring

## 📞 Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify Google Cloud Console settings
3. Test API connectivity
4. Check file permissions

---

**Note:** This integration provides a seamless way to store student project evidence in Google Drive while maintaining the existing local storage as a backup. The system gracefully handles failures and continues to work even if Google Drive is unavailable.
