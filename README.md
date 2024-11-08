# PHOTO MANAGEMENT SYSTEM - API AND WORKFLOW DOCUMENTATION

## 1. SYSTEM OVERVIEW

The system is organized into a hierarchical structure:
- **Event** -> **Folders** -> **Photos**

**Authentication**: All endpoints require the `X-API-KEY` header.

---

## 2. API ENDPOINTS

### EVENTS

1. **Create Event**
   - **Endpoint**: `POST /events/create`
   - **Body**:
     ```json
     {
       "name": "Event Name",
       "description": "Event Description",
       "date": "2024-03-20",
       "eventPicture": "optional-url"
     }
     ```

2. **Get Events**
   - **Endpoint**: `GET /events/all`

3. **Update Event**
   - **Endpoint**: `POST /events/update`
   - **Body**:
     ```json
     {
       "id": "event-id",
       "name": "Updated Name",
       "description": "Updated Description",
       "date": "2024-03-21"
     }
     ```

4. **Delete Event**
   - **Endpoint**: `DELETE /events/delete/:id`

---

### FOLDERS

1. **Create Folder**
   - **Endpoint**: `POST /folders/create`
   - **Body**:
     ```json
     {
       "name": "Folder Name",
       "description": "Folder Description",
       "date": "2024-03-20",
       "folderPicture": "optional-url",
       "eventId": "parent-event-id"
     }
     ```

2. **Get Folders**
   - **Endpoint**: `GET /folders/all?eventId=<event-id>`

3. **Update Folder**
   - **Endpoint**: `PUT /folders/update`
   - **Body**:
     ```json
     {
       "id": "folder-id",
       "name": "Updated Name",
       "description": "Updated Description",
       "date": "2024-03-21"
     }
     ```

4. **Delete Folder**
   - **Endpoint**: `DELETE /folders/delete/:id`

---

### PHOTOS

1. **Upload Multiple Photos**
   - **Endpoint**: `POST /api/photos`
   - **FormData**:
     - `photos`: [file1, file2, ...]
     - `eventId`: "event-id"
     - `folderId`: "folder-id"

2. **Upload Single Photo**
   - **Endpoint**: `POST /api/photos/upload`
   - **FormData**:
     - `file`: single-file

3. **Get Photos**
   - **Endpoint**: `GET /api/photos/event?eventId=<event-id>&folderId=<folder-id>&skip=0&limit=20`

4. **Get Single Photo**
   - **Endpoint**: `GET /api/photos/:id`

---

## 3. DATA MODELS

### EVENT MODEL
- `name` (required)
- `description` (required)
- `date` (required)
- `eventPicture` (optional)
- `folders` (array of folder references)

### FOLDER MODEL
- `name` (required)
- `description` (required)
- `date` (required)
- `eventId` (required)
- `folderPicture` (optional)

### PHOTO MODEL
- `filename` (required)
- `eventId` (required)
- `folderId` (required)
- `url` (required)
- `createdAt` (automatic)

---

## 4. TYPICAL WORKFLOW

1. **Create an Event**
   - Send `POST` request to `/events/create`
   - Receive `event ID` in response

2. **Create Folder(s) in Event**
   - Send `POST` request to `/folders/create`
   - Include `eventId` from step 1
   - Receive `folder ID` in response

3. **Upload Photos**
   - Send `POST` request to `/api/photos`
   - Include both `eventId` and `folderId`
   - Photos are automatically:
     - Compressed
     - Stored in Google Cloud Storage
     - Referenced in MongoDB

4. **Retrieve Photos**
   - Use `GET /api/photos/event` with pagination
   - Photos are served from Google Cloud Storage

---

## 5. TECHNICAL FEATURES

### IMAGE PROCESSING
- Automatic compression using Sharp
- Quality set to 30% for storage optimization
- Maintains aspect ratio
- Generates unique filenames

### STORAGE
- Images stored in Google Cloud Storage
- Metadata stored in MongoDB
- Public URLs generated for access

### SECURITY
- API Key authentication
- Input validation
- File type verification
- Size limits enforced

### PERFORMANCE
- Image compression
- Pagination support
- Efficient database queries
- Clustered server deployment

---

## 6. ERROR HANDLING

### STATUS CODES
- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **404** - Not Found
- **500** - Server Error

### ERROR RESPONSE FORMAT
```json
{
    "message": "Error description"
}
