import pandas as pd

def get_msa_file(config):
    """
    Fetches and returns the MSA crosswalk file
    
    Parameters
    ----------
    config: JSON

        
    Returns
    ----------
    DataFrame
        MSA crosswalk 
    """
    base_path = config['base_path']
    msa_file = config['national']['msa_csa_crosswalk']
    msa_path = f"{base_path}/national/{msa_file}"
    msa_crosswalk = pd.read_csv(msa_path, encoding="ISO-8859-1")
    msa_crosswalk = msa_crosswalk['County Code'].astype(str).str.zfill(5)
    return msa_crosswalk


def get_counties_in_msa(config, msa_id):
    """
    Returns a list of counties that make up an MSA
    
    Parameters
    ----------
    msa_id: str
        
        
    Returns
    ----------
    List
        List of 5-digit county codes
    """
    msa = get_msa_file(config)
    return list(msa[msa['MSA Code']==msa_id]['County Code'])


def get_states_in_msa(config, msa_id):
    """
    Returns a list of state codes that an MSA spans
    
    Parameters
    ----------
    msa_id: str
           
    Returns
    ----------
    List
        List of 2-letter state codes
    """
    msa = get_msa_file(config)
    return list(msa[msa['MSA Code']==msa_id]['MSA Title'])[0].split(', ')[1].split('-')