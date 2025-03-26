import pandas as pd
from utils import consumption_utils
from utils.utils import load_data_consumption

# Material Consumption Analysis File Uploader
def material_consumption_upload(dataFrame: pd.DataFrame):
    df = load_data_consumption(dataFrame)  # Read the file

    # Check if 'Material Group' column exists
    if 'Material Group' in df.columns:
        unique_groups = df['Material Group'].astype(str).unique()  # Get unique values

        for group in unique_groups:
            # Filter data for the current Material Group
            df_filtered = df[df['Material Group'].astype(str) == str(group)]

            # TODO: Adjust the functions below to not using Streamlit and make it compatible with react

            # Run analysis functions in the correct order
            # df_more_filtered, top_n = consumption_utils.overall_consumption_patterns(df_filtered)
            # llm_response = consumption_utils.outlier_detection(df_more_filtered, top_n)
            # consumption_utils.specific_material_analysis(df_filtered)
            # consumption_utils.shelf_life_analysis(df_filtered)

            vendor_consumption_analysis = consumption_utils.vendor_consumption_analysis(df_filtered)
            location_consumption_analysis = consumption_utils.location_consumption_analysis(df_filtered)
            variability_analysis = consumption_utils.batch_variability_analysis(df_filtered)
            combined_analysis = consumption_utils.combined_analysis(df_filtered)
            
            return {
                "code": 0,
                "data": {
                    **vendor_consumption_analysis,
                    **location_consumption_analysis,
                    **variability_analysis,
                    **combined_analysis,
                }
            }

    else:
        return {
            "code": -1,
            "data": "No Material Group column found in the uploaded file."
        }
