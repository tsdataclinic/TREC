# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


## Requirements

You'll need to create an `.env` file based on `.env.sample` for the app to run.



## Datasets

For Flood risk data, the data is converted to tileset data via the [tippecanoe](https://github.com/felt/tippecanoe) tool and then hosted on Mapbox.

## Initializing the DB

```
docker-compose up
docker ps # to get container id
docker exec -it <container_id> /bin/bash

ogr2ogr -f "PostgreSQL" PG:"dbname=trec user=postgres" "/data/public/hospitals.geojson" -nln hospitals
ogr2ogr -f "PostgreSQL" PG:"dbname=trec user=postgres" "/data/public/stop_features.geojson" -nln stop_features

```

## Initializing the tileserver

TREC makes use of Martin, a web tileserver. It should start in the previous step by running `docker-compose up` but ensure it is running by visiting `localhost:3002/catalog` and looking for the `stop_features` and `hospitals` tables.

## Starting the API locally

- `cd app/` and make sure all Python requirements are installed `pip install -r requirements.txt`

- `cd` into `backend/`

- run `uvicorn main:app --reload`

- examine `localhost:8000/docs` to see if the FastAPI Swagger docs are loaded

