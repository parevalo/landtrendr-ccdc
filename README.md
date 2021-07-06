# LandTrendr-CCDC Comparison Tool

**This tool can be used to visualize and compare the outputs of the LandTrendr and CCDC algorithms for a single Landsat pixel**

The scripts in this repository facilitate interactively running the LandTrendr (Landsat-based detection of Trends in Disturbance and Recovery) and CCDC (Continuous Change Detection and Classification) algorithms concurrently for clicked pixels, and resulting charts enable comparison of both time series inputs and temporal segmentation results. This repository includes a modified copy of LandTrendr utilities and relies on functionality from the CCDC algorithm API.

**Getting started:**

The code in this repository can be added to your Earth Engine scripts by clicking [here](https://code.earthengine.google.com/?accept_repo=users/parevalo_bu/landtrendr-ccdc), and will be displayed in the Reader section.

The main visualization tool is accessible by running `LandTrendr-CCDC.js`. 

Key parameters for the LandTrendr and CCDC algorithms can be adjusted in the left-hand panel, and clicking the map will interactively display both LandTrendr and CCDC Landsat inputs and segmentation results for the selected pixel in a set of charts in the right-hand panel. _Note: CCDC is a more computationally intensive algorithm and results may be slow to load and display._

Additional LandTrendr utilities are included in `LandTrendr.js` and a description of the original LandTrendr utilities can be found [here](https://emapr.github.io/LT-GEE/).

Users must also enable access to CCDC visualization utilities by clicking [here](https://code.earthengine.google.com/?accept_repo=users/parevalo_bu/gee-ccdc-tools) to connect to the GEE-CCDC Tools repository, also described [here](https://github.com/parevalo/gee-ccdc-tools).

## Manuscript
This tool was designed to accompany an in-prep manuscript intended to provide high-level comparison current limitations, ongoing challenges, and opportunities for future integration and comparison of LandTrendr and CCDC approaches and map products.

Example CSVs and PNGs generated using the comparison tool are available in the [examples](https://github.com/parevalo/landtrendr-ccdc/tree/main/examples) directory, and an iPython notebook for recreating key figures from the manuscript is available [here](https://github.com/parevalo/landtrendr-ccdc/blob/main/paper_figures.ipynb).

## Citations

LandTrendr implementation in GEE: Kennedy, R.E., Yang, Z., Gorelick, N., Braaten, J., Cavalcante, L., Cohen, W.B., Healey, S. (2018). [Implementation of the LandTrendr Algorithm on Google Earth Engine](https://www.mdpi.com/2072-4292/10/5/691). _Remote Sensing_. 10, 691.

CCDC implementation in GEE: _Coming soon!_

Third-party CCDC utilities used in this tool: Arévalo, P., Bullock, E.L., Woodcock, C.E., Olofsson, P., 2020. A Suite of Tools for Continuous Land Change Monitoring in Google Earth Engine. Front. Clim. 2. https://doi.org/10.3389/fclim.2020.576740

