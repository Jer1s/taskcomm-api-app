# Task Comm backend

<div>
  <a href="https://www.npmjs.com/package/npm"><img alt="npm version" src="https://img.shields.io/badge/npm@latest-v9.6.6-CB3837?style=flat&logo=npm&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/express"><img alt="Express version" src="https://img.shields.io/badge/Express-v4.18.2-000000?style=flat&logo=Express&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/sequelize"><img alt="Sequelize version" src="https://img.shields.io/badge/Sequelize-v6.31.1-52B0E7?style=flat&logo=Sequelize&logoColor=white"></a>
  <a href="https://www.npmjs.com/package/mysql2/"><img alt="MySQL version" src="https://img.shields.io/badge/MySQL2-v3.3.0-4479A1?style=flat&logo=MySQL&logoColor=white"></a>
</div>

Task Comm project is a web application being developed to provide a web service that allows users to store to-do list.

This repository is the backend part of TaskComm project.

## Deploy

The server can be accessed at [https://taskcomm-api-app.herokuapp.com/](https://taskcomm-api-app.herokuapp.com/).

## Project Structure

```
backend
├─ .gitignore
├─ LICENSE.md
├─ README.md
├─ app.js
├─ config
│  └─ config.js
├─ controller
│  └─ index.js
├─ migrations
│  ├─ 20230508082825-create-user.js
│  └─ 20230508082912-create-post.js
├─ models
│  ├─ index.js
│  ├─ post.js
│  └─ user.js
├─ package-lock.json
├─ package.json
└─ seeders
   ├─ 20230508083106-initialUsers.js
   └─ 20230508083115-initialPosts.js

```

- config/: This folder is for storing configuration files
- migrations/: This folder is for managing database schema changes.
- models/: This folder is for defining sequelize models.
- seeders/: This folder is for managing seed data for database initialization.

## License

This project is licensed under the MIT License. See the LICENSE.md file for details.

## Progress

- [x] Make User Model
- [x] Make Post Model
- [x] Respond to post resquest
- [x] Add order, section, is_hide fields to the Posts model
- [ ] Associate Posts with User (N:1)
- [ ] Implement JWT Web Token login
