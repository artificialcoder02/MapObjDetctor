import os
import geopandas as gpd

# Directory where GeoJSON files are stored
current_directory = os.getcwd() 
#print(current_directory + '..'+ '\geoj');   

geojson_folder = current_directory + '\geoj'

# Get a list of GeoJSON files in the folder
geojson_files = [f for f in os.listdir(geojson_folder) if f.endswith(".geojson")]

# Sort the list of files by creation time (most recent first)
geojson_files.sort(key=lambda x: os.path.getctime(os.path.join(geojson_folder, x)), reverse=True)

# Check if there are any GeoJSON files in the folder
if not geojson_files:
    print("No GeoJSON files found in the folder.")
else:
    # Choose the most recent GeoJSON file
    most_recent_geojson = os.path.join(geojson_folder, geojson_files[0])

    # Extract the base name of the most recent GeoJSON file (without the extension)
    base_name = os.path.splitext(os.path.basename(most_recent_geojson))[0]

    # Read the most recent GeoJSON file into a GeoDataFrame
    gdf = gpd.read_file(most_recent_geojson)

    # Set the output shapefile path and filename (in the "Shaper" folder)
    shapefile_output = os.path.join(current_directory + '\shaper', base_name)

    # Save the GeoDataFrame as a shapefile
    gdf.to_file(shapefile_output, driver="ESRI Shapefile")
    print(f"Successfully converted {most_recent_geojson} to {base_name}.shp in the 'Shaper' folder.")