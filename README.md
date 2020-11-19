# LandTrendr - CCDC

**Tool to compare the outputs of the LandTrendr and CCDC algorithms for a single Landsat pixel**

The scripts in this repository enable users to interactively run the LandTrendr and CCDC temporal segmentation algorithms for clicked pixels. This repository includes a modified copy of the LandTrendr utility that displays the algorithm results for a single pixel. We have also added functionality from the CCDC algorithm.

**Getting started:**

The code in this repository can be accessed and run in GEE directly [here](https://code.earthengine.google.com/?accept_repo=users/parevalo_bu/landtrendr-ccdc)

The main visualization tool is available by running `LandTrendr-CCDC.js`. Key parameters for the LandTrendr and CCDC algorithms can be adjusted in the left-hand panel, and clicking the map will interactively display both LandTrendr and CCDC Landsat inputs and segmentation results for the selected pixel in a set of charts in the right-hand panel. Note: CCDC is a more computationally intensive algorithm and results may be slow to load.

Additional LandTrendr utilities are included in `LandTrendr.js` and a description of the original LandTrendr utilities can be found [here](https://emapr.github.io/LT-GEE/).

Users must also enable access to CCDC visualization utilities by connecting to the GEE-CCDC Tools repository [here](https://code.earthengine.google.com/?accept_repo=users/parevalo_bu/gee-ccdc-tools) and described [here](https://github.com/parevalo/gee-ccdc-tools).


## Manuscript

## Citations

LandTrendr implementation in GEE: Kennedy, R.E., Yang, Z., Gorelick, N., Braaten, J., Cavalcante, L., Cohen, W.B., Healey, S. (2018). [Implementation of the LandTrendr Algorithm on Google Earth Engine](https://www.mdpi.com/2072-4292/10/5/691). _Remote Sensing_. 10, 691.

CCDC implementation in GEE: _Coming soon!_

Third-party CCDC utilities used in this tool: Arévalo, P., Bullock, E., Woodcock, C.E., Olofsson, P. (2020). A suite of tools for Continuous Land Change Monitoring in the Google Earth Engine. _Frontiers in Climate_ (in press)
