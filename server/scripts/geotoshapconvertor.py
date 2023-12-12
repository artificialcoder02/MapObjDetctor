import argparse
import os
import geopandas as gpd

def convert_geojson_to_shapefile(geojson_folder, output_folder , folder_name):
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
        #base_name = os.path.splitext(os.path.basename(most_recent_geojson))[0]
        base_name = folder_name

        # Read the most recent GeoJSON file into a GeoDataFrame
        gdf = gpd.read_file(most_recent_geojson)

        # Set the output shapefile path and filename (in the specified output folder)
        shapefile_output = os.path.join(output_folder, base_name)

        # Save the GeoDataFrame as a shapefile
        gdf.to_file(shapefile_output, driver="ESRI Shapefile")
        print(f"Successfully converted {most_recent_geojson} to {base_name}.shp in the specified output folder.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert most recent GeoJSON file to Shapefile.")
    parser.add_argument("--geojson_folder", required=True, help="Path to the folder containing GeoJSON files")
    parser.add_argument("--output_folder", required=True, help="Path to the output folder for Shapefiles")
    parser.add_argument("--folder_name", required =True,help="Contains the Name of the Shapefile")

    args = parser.parse_args()

    convert_geojson_to_shapefile(args.geojson_folder, args.output_folder ,args.folder_name)
