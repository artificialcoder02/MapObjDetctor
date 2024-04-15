import argparse
import os
import geopandas as gpd

def convert_geojson_to_shapefile(geojson_folder, output_folder, folder_name):
    geojson_files = [f for f in os.listdir(geojson_folder) if f.endswith(".geojson")]
    geojson_files.sort(key=lambda x: os.path.getctime(os.path.join(geojson_folder, x)), reverse=True)

    if not geojson_files:
        print("No GeoJSON files found in the folder.")
        return None

    most_recent_geojson = os.path.join(geojson_folder, geojson_files[0])
    gdf = gpd.read_file(most_recent_geojson)
    shapefile_output = os.path.join(output_folder, folder_name)

    gdf.to_file(shapefile_output, driver="ESRI Shapefile")
    print(f"Successfully converted {most_recent_geojson} to {shapefile_output}")
    return shapefile_output

def modify_shapefile(input_shapefile, output_folder,folder_name):
    gdf = gpd.read_file(input_shapefile)
    # Check the current CRS
    print(f"Original CRS: {gdf.crs}")
    gdf_projected = gdf.to_crs(epsg=4326)  
    # 1. Buffer operation
    buffer_distance = -0.00003  
    gdf_buffered = gdf_projected.copy()
    gdf_buffered['geometry'] = gdf_projected.buffer(buffer_distance)
    # 2. Dissolve
    gdf_dissolved = gdf_buffered.dissolve(by='name').reset_index()
    # 3. Multipart to Singlepart
    gdf_singlepart = gdf_dissolved.explode()
    # 4. Negative Buffer
    negative_buffer_distance = 0.00003
    gdf_neg_buffered = gdf_singlepart.copy()
    gdf_neg_buffered['geometry'] = gdf_singlepart.buffer(negative_buffer_distance)
    # 5. Simplify
    tolerance = 0.00003
    gdf_simplified = gdf_neg_buffered.copy()
    gdf_simplified['geometry'] = gdf_neg_buffered.simplify(tolerance, preserve_topology=True)
    # Convert back to GeoDataFrame for the simplification result
    gdf_final = gdf_simplified.copy()
    ''' OPTIONAL '''
    gdf_final = gdf_final.to_crs(gdf.crs)
    
    modified_output_path = os.path.join(output_folder,folder_name, os.path.basename(input_shapefile) + '_modified')
    gdf_final.to_file(modified_output_path, driver="ESRI Shapefile")
    print(f"Successfully modified and saved shapefiles to {modified_output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert GeoJSON file to Shapefile and apply modifications.")
    parser.add_argument("--geojson_folder", required=True, help="Path to the folder containing GeoJSON files")
    parser.add_argument("--output_folder", required=True, help="Path to the output folder for Shapefiles")
    parser.add_argument("--folder_name", required=True, help="Base name for the output Shapefiles")

    args = parser.parse_args()
    
    original_shp = convert_geojson_to_shapefile(args.geojson_folder, args.output_folder, args.folder_name)
    if original_shp:
        modify_shapefile(original_shp, args.output_folder , args.folder_name)
