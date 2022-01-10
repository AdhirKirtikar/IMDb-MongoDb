# IMDb-MongoDb

## Inspiration
This project is created for participating in [MongoDB Atlas Hackathon on DEV](https://dev.to/devteam/announcing-the-mongodb-atlas-hackathon-on-dev-4b6m) in category "Choose Your Own Adventure" and to learn more about the modern database platform of MongoDB Atlas. 

## What it does
This is a simple Node.js Express web app in which you can search for movies based on various criteria and see the stats & details of the movies e.g. duration, language, ratings, Cast & Crew etc.

## How I built it
- This is a Node.js Express web app with only 2 routes: [index](https://github.com/AdhirKirtikar/IMDb-MongoDb/blob/master/routes/index.js) & [search](https://github.com/AdhirKirtikar/IMDb-MongoDb/blob/master/routes/search.js).
- The source code is in this repo [IMDb-MongoDb](https://github.com/AdhirKirtikar/IMDb-MongoDb).
- The code uses Node.js native drivers for MongoDB and connects to a MongoDB database deployment which is Multi Region Replica Set of 12 nodes.
- The database consists of data from imdb sourced from a [Kaggle dataset](https://www.kaggle.com/trentpark/imdb-data).
- The app is packaged in a [Docker container](https://hub.docker.com/repository/docker/adhirkirtikar/imdb-mongodb) _automagically_ using [GitHub actions](https://github.com/AdhirKirtikar/IMDb-MongoDb/actions). 
- The docker container is deployed to 3-node Kubernetes cluster hosted on [Civo](https://www.civo.com) using Helm charts with ArgoCD which was installed very easily and quickly in the Civo cluster.
- The app endpoint is published via Traefik Ingress (again auto install in Civo cluster) and is embedded in the home page hosted on [.xyz](https://gen.xyz) domain.
- The webpage link for the application is [IMDb-MongoDb](http://www.adhirkirtikar.xyz/imdb-mongodb.html).

## Challenges I ran into
- I had to learn routing in Node.js Express and how to build a docker image which ran the app successfully, especially building the image with GitHub Actions and storing the connection string details in .env file inside the image.
- Creating the Kubernetes cluster in Civo was very easy and intuitive, with various applications automatically installed, configured and ready for use like ArgoCD, Kubernetes Dashboard, Traefik etc, so not much challenges faced for using Civo!
- Configuring ArgoCD with Helm charts was easy as well.
- The MongoDB dataset was connecting without any issues from my local development environment, but having connectivity issues from Civo deployment. Added firewall rules to allow port 27017 for MongoDB, changed connection string options, added multi region replica set which contains 3 electable nodes for high availability in US East region and 9 read only nodes all over the world.

## Accomplishments that I'm proud of
Fully automated CI/CD:
- Commit in GitHub starts a GitHub Action which builds the Docker image and pushes to DockerHub.
- ArgoCD detects the change in the GitHub repo and syncs the Kubernetes deployment automatically.
- Horizontal Pod AutoScaler automatically detects the CPU usage and scales the pods from minimum 5 to maximum 20.

## What I learned
- Node.js Express, Docker, GitHub Actions, Kubernetes (including HPA), ArgoCD and Helm.
- Civo Kubernetes cluster, using firewall for MongoDB connections and .xyz domain creation.
- MongoDB Atlas and using Node.js native drivers for MongoDB.
- Building a query using JSON, executing it, getting results in JSON and displaying the results using Pug (Jade) template engine.