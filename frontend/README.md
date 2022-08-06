# Reddit Clone front-end  
This is the front-end part of the full-stack reddit clone.  

## Available Scripts

In the project directory, you can run:

```
yarn
```
This will install all dependencies.

```
yarn dev
```

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes. You may also see any lint errors in the console.  

```
yarn gen
```  

Every time you need to add a `mutation` or a `query` you can write them in their proper file inside `graphql` folder. Then `gen` command will generate out a hook inside `generated` folder that you will use in your components.  

```
yarn build
```

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes. Your app is ready to be deployed!
