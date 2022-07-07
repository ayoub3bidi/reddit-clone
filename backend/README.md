# Reddit Clone Server  
This is the back-end part of the full-stack reddit clone.

## Setup

### PostgreSQL and Redis databases configuration
* You need PostgreSQL to be installed in your machine, then create a database you name it `redditBase`.  
In the `src` folder you will find `example.constants.ts` please change it to `constants.ts` and replace "your password" in `pwd` with your PostgreSQL password.  
* You need Redis to be installed in your machine (for macOS or Linux you can go directly follow the [docs](https://redis.io/docs/getting-started/installation/), but for windows you need to install WSL2 first from [here](https://docs.microsoft.com/en-us/windows/wsl/install), then you can go to the docs).  
To start the redis server you can run this command:
```
sudo service redis-server start
```

### Scripts
In this directory, to make it run properly please run these commands in order:  

```
yarn
```
This will install all dependencies.

**Note**: Please run the next two commands in two seprate terminals.  

```
yarn watch
```
This will run TypeScript with watch flag (`tsc -w`) to convert it into JavaScript in the dist folder in real time.  

```
yarn dev
```
This will listen to the code changes in the `index.js` file (from the dist folder) and run it in real time using nodemon.  

```
yarn create:migration
```
This will create migration using MikroORM CLI (`mikro-orm migration:create`).  

## Playing around with GraphQL
Using the Apollo server you can play around with the GraphQL queries on [localhost:5000/graphql](http://localhost:5000/graphql).  
You can check the `resolvers` folder to see the CRUD functions.  
