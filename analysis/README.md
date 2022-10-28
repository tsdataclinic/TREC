Building climate resilience using Public Transit: Data Science
==============================


## Data Science Environment set-up

1. SSH into EC2 with the private key
```
ssh user@ec2-54-91-96-130.compute-1.amazonaws.com -i ~/.ssh/id_XXXX
```

2. Set-up Git and clone the repo
Instructions for SSH set-up for Git [here](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).
```
git clone git@github.com:tsdataclinic/TOP-Sprint.git
```

3. Create Python environment
We are using `pipenv` for maintaining the python environment. To install `pipenv`:
```
pip3 install pipenv
```
The repo has the `Pipfile` in the `analysis/` directory. To install all the libraries in the `Pipfile`:

```
cd analysis
pipenv install
```

To start the virtual environment:
```
pipenv shell
```

To install new libraries and save it to the `Pipfile`
```
pipenv install numpy
```

4. Set-up Jupyter environment
The AWS instance is set-up with ports between 8701-8750 open. We can lauch the jupyter notebook/lab instance to one of these ports. Additionally, this also requires authentication.

a. Set-up Ipython authentication
```
ipython

from IPython.lib import passwd

passwd() ## Enter the password and *copy* the hash that it returns
quit() ## to quit out of the Ipython shell
```

b. Create Jupyter config
We will save this and other setting in the config file.

```
jupyter notebook --generate-config

## Open the config file in vim (or any other editor)
vim ~/.jupyter/jupyter_notebook_config.py
```
Add the following to the config file:

```
c.NotebookApp.password = u' ## the copied hash ## `
c.NotebookApp.port = PORT ## Choose one of the unused ports b/w 8701-8750 
```
Used Ports: [8725, 8734]

c. Add the pipenv environement to Jupyter kerner

```
python -m ipykernel instal --user --name=Top_Sprint

```

d. Launch Jupyter Lab/Notebook

```
jupyter lab --no-browser
```

5. SSH tunnel to access the jupyter session

```
ssh -NfL localhost:8888:localhost:PORT user@ec2-54-91-96-130.compute-1.amazonaws.com -i ~/.ssh/id_XXXX
```

Now go to `localhost:8888` in your local browser and you'll be prompted to enter the password chosen at Step 4a.


### Link in the data

Instrcutions for saving and loading data to/from the S3 Bucket. 


### Git stuff 

We encourage people to follow the git feature branch workflow which you can read more about here: [How to use git as a Data Scientist](https://towardsdatascience.com/why-git-and-how-to-use-git-as-a-data-scientist-4fa2d3bdc197)

For each feature you are adding to the code 

1. Switch to the master branch and pull the most recent changes 
```
git checkout master 
git pull
```

2. Make a new branch for your addition 
```
git checkout -b cleaning_script
``` 
3. Write your awesome code.
4. Once it's done add it to git 
```
git status
git add {files that have changed}
git commit -m {some descriptive commit message}
```
5. Push the branch to gitlab 
```
git push -u origin cleaning_script
``` 
6. Go to GitHub and create a merge request.
7. Either merge the branch yourself if your confident it's good or request that someone else reviews the changes and merges it in.
8. Repeat
9. ...
10. Profit.

Project Organization
------------

Directory Structure:

    ├── LICENSE
    ├── README.md          <- The top-level README for developers using this project.
    ├── data
    │   ├── external       <- Data from third party sources.
    │   ├── interim        <- Intermediate data that has been transformed.
    │   ├── processed      <- The final, canonical data sets for modeling.
    │   └── raw            <- The original, immutable data dump.
    │
    ├── notebooks          <- Jupyter notebooks. Naming convention is a number (for ordering),
    │                         the creator's initials, and a short `-` delimited description, e.g.
    │                         `1.0-jqp-initial-data-exploration`.
    │
    ├── reports            <- Generated analysis as HTML, PDF, LaTeX, etc.
    │   └── figures        <- Generated graphics and figures to be used in reporting
    │
    ├── setup.py           <- makes project pip installable (pip install -e .) so src can be imported
    ├── src                <- Source code for use in this project.
    │   ├── __init__.py    <- Makes src a Python module
    │   │
    │   ├── data           <- Scripts to download or generate data
    │   │   └── make_dataset.py
    │   │
    │   ├── features       <- Scripts to turn raw data into features for modeling
    │   │   └── build_features.py
    │   │
    │   └── visualization  <- Scripts to create exploratory and results oriented visualizations
    │       └── visualize.py


--------

<p><small>Project based on the <a target="_blank" href="https://drivendata.github.io/cookiecutter-data-science/">cookiecutter data science project template</a>. #cookiecutterdatascience</small></p>
