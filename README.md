# Todo Website

This repository contains the source code for a Todo website built with Svelte, Node.js, Express, and Nginx. The website allows users to manage their tasks and includes JWT authentication for secure user login and registration. It utilizes Docker containers for easy deployment and Nodemailer for email functionality.

## Features

- User registration and login using JWT authentication
- Create, update, and delete tasks
- Mark tasks as complete
- Password reset via email

## Technologies Used

- Frontend: Svelte
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT (JSON Web Tokens)
- Web Server: Nginx
- Containerization: Docker

## Running locally
Prerequisites:
- Docker installed and working

1. Clone the repository: 
```shell 
git clone https://github.com/shouryaeaga/TODO-app.git
cd todo-app
```

2. Configure environment variables: for the backend, create a '**.env**' file in the directory '**src/backend**'. Set the following environment variables:
```env
DATABASE_HOST = db
DATABASE_PORT = 5432
DATABASE_USERNAME = username of database
DATABASE_PASSWORD = password_of database
DATABASE_NAME = name of database

# JWT
JWT_SECRET = make a long secret: use a generator

# EMAIL
EMAIL_SMTP_SERVER_PORT = port of your server
EMAIL_SERVICE = if you use a well known service like gmail, look at this page: https://community.nodemailer.com/2-0-0-beta/setup-smtp/well-known-services
EMAIL_SMTP_SERVER = address to your smtp server
EMAIL_FROM = your email address
EMAIL_USER = username of your email
EMAIL_PASS = password of your email
```
Furthermore, go to the directory for your frontend: '**root_dir/src/frontend**', then go to '**src/lib**' and edit the file '**appConfig.js**' to your backend url, so in this case, '**http://localhost/api**'

3. Setting docker compose values:
Go to the main docker compose file: '**root_dir/docker-compose.yml**' and edit it with your own custom values for the postgres database.

4. Populating postgres database with tables:
Firstly run the containers and go into the database:
```shell
docker compose up -d
```

```shell
docker exec -it *name of container* psql -U *username of database* -d *name of database*
```
Now run the following commands to make tables:
```shell
CREATE TABLE users (
  id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  username VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255),
  password_token VARCHAR(255),
  admin BOOLEAN DEFAULT FALSE
);
```
```shell
CREATE TABLE users (
  id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  username VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  refresh_token VARCHAR(255),
  password_token VARCHAR(255),
  admin BOOLEAN DEFAULT FALSE
);
```shell
CREATE TABLE todos (
  id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id),
  details VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);
```
5. Go to http://localhost and enjoy your todo app running locally.

## License
This project is licensed under the MIT License.
