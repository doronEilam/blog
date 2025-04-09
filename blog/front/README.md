# My Blog App

## Project Description
My Blog App is a REST API-based platform for managing articles and comments. The system provides different functionalities based on user roles:
- **Anonymous Users**: Can only read articles and comments.
- **Registered Users (blog_user)**: Can read and add comments to articles.
- **Editors (editor/author)**: Can add articles, update articles they have published, and delete comments.
- **Administrators (admin/superuser)**: Can publish articles, delete and edit articles, write and delete comments, update user details, manage categories and tags.

The project includes forms for registration, login, and logout, as well as a dedicated admin dashboard for managing the platform.

---

## Technologies Used
- **Django** and **Django Rest Framework** for the backend.
- **PostgreSQL** as the database.
- **React** for the frontend.
- Additional libraries listed in `requirements.txt`.

---

## Installation and Setup

### System Requirements
- Python 3.9 or higher
- Node.js 16 or higher
- PostgreSQL installed and configured

### Installing Required Libraries
Run the following command in the terminal to install the required libraries:
```bash
pip install -r requirements.txt
venv\Scripts\activate
```

### Running the Backend
1. Configure the database in the `settings.py` file under the `DATABASES` section.
2. Apply migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
3. Start the server:
   ```bash
   python manage.py runserver
   ```

### Running the Frontend
1. Navigate to the `front` directory:
   ```bash
   cd front
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm start
   ```

---

## Example Users
Below is a list of registered users and their credentials:

### Administrators (Admin/Superuser)
- **Username**: doron           **Password**: 123456

### Editors (Editor/Author)
- **Username**: doron11         **Password**: abcd1234!  
- **Username**: doron96         **Password**: abcd1234!  
- **Username**: doron100        **Password**: abcd1234!  
- **Username**: doron123        **Password**: abcd1234!  

### Regular Users (blog_user)
- **Username**: doron1          **Password**: abcd1234!  
- **Username**: doron5          **Password**: abcd1234!  
- **Username**: doron6          **Password**: abcd1234!  
- **Username**: doron7          **Password**: abcd1234!  

---

## Key Features
1. **Article Management**:
   - Create, read, update, and delete articles.
   - Add multiple categories (at least one is required) and multiple tags to articles.
   - Search articles using the top navigation bar by title, content, categories, tags, or author name.

2. **Comment Management**:
   - Registered users can add comments to articles.
   - Editors can delete comments.

3. **Category and Tag Management**:
   - Administrators can add, edit, and delete categories and tags.

4. **User Management**:
   - Administrators can edit user details and delete users.

5. **Admin Dashboard**:
   - A dedicated interface for administrators to manage the entire platform.

---

## API Usage Examples
### Fetching Articles
**Request**:
```http
GET /api/articles/
```

**Response**:
```json
[
  {
    "id": 1,
    "title": "First Article",
    "content": "This is the content of the first article.",
    "tags": ["Tech", "News"],
    "categories": ["Technology"],
    "author": "doron11"
  }
]
```

### Adding a Comment
**Request**:
```http
POST /api/comments/
Content-Type: application/json

{
  "article_id": 1,
  "content": "Great article!"
}
```

**Response**:
```json
{
  "id": 101,
  "article_id": 1,
  "content": "Great article!",
  "author": "doron1",
  "created_at": "2025-04-07T12:00:00Z"
}
```

---

## Credits
This project was developed by Doron Eilam.  
**Note**: This project is for educational purposes only. Copying, duplicating, or publishing the code without explicit permission is prohibited.

---

## License
This project is protected by copyright. All rights reserved.
