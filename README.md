# <p align = "center"> SingMeASong Backend </p>

Check project frontend [here](https://github.com/williameiji/repo-provas-frontend)

## :clipboard: Descrição

Sing me a song is an application for anonymous song recommendation. The more people like a recommendation, the more likely it is to be recommended to others.

---

## :computer: Technologies and Concepts

- REST APIs
- Node.js
- TypeScript
- SQL with Prisma
- Joi
- Jest
- Supertest
- Nodemon

---

## :rocket: Routes

```yml
POST /recommendations
    - Route to register a new song
    - headers: {}
    - body: {
        "name": "Lorem Ipsum",
        "youtubeLink": "https://www.youtube.com/watch?v=PPqC0Hd9D7U&t=1872s",
    }
```

```yml
POST /recommendations/:id/downvote
    - Route to downvote a recommendation
    - headers: {}
    - body: {}
```

```yml
POST /recommendations/:id/upvote
    - Route to upvote a recommendation
    - headers: {}
    - body: {}
```

```yml
GET /recommendations
- Route to list all recommendations
```

```yml
GET /recommendations/:id
- Route to list a recommendation by id
```

```yml
GET /recommendations/random
- Route to list a random recommendation by downvotes/upvotes
```

```yml
GET /recommendations/top/:amount
- Route to list a specified amount of recommendations from most voted to least voted
```

## 🏁 Running the application

This project was started with the [Express](https://www.npmjs.com/package/express), so make sure you have the latest stable version of [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/) running locally.

First, clone this repository on your machine:

```
git clone https://github.com/williameiji/singmeasongo-backend
```

Then, inside the folder, run the following command to install the dependencies.

```
npm install
```

Run the following command to create tables

```
npx prisma migrate dev
```

Finished the process, just start the server

```
npm run dev
```
