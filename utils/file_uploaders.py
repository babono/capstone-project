import pandas as pd
import utils as st
from ..app.utils import data, consumption_utils, order_placement_utils, goods_receipt_utils, lead_time_analysis

# Material Consumption Analysis File Uploader
def material_consumption_upload():
    uploaded_file = st.file_uploader("Upload Consumption Excel File for Analysis", type=["xlsx"])
    if uploaded_file:
        df = data.load_data_consumption(uploaded_file)  # Read the file

        # Check if 'Material Group' column exists
        if 'Material Group' in df.columns:
            unique_groups = df['Material Group'].astype(str).unique()  # Get unique values

            for group in unique_groups:
                st.subheader(f"Material Group {group} Analysis")

                # Filter data for the current Material Group
                df_filtered = df[df['Material Group'].astype(str) == str(group)]

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
                    "vendor_consumption_analysis": vendor_consumption_analysis,
                    "location_consumption_analysis": location_consumption_analysis,
                    "variability_analysis" : variability_analysis,
                    "combined_analysis": combined_analysis,
                }

        else:
            st.error("The uploaded file does not contain a 'Material Group' column. Please check the file format.")

# Order Placement Analysis File Uploader - Need to be adjusted for Streamlit custom component response
def order_placement_upload():
    uploaded_file = st.file_uploader("Upload Order Placement Excel File for Analysis", type="xlsx")
    if uploaded_file:
        df = order_placement_utils.preprocess_order_data(uploaded_file)  # Read the file

        # Check if 'Material Group' column exists
        if 'Material Group' in df.columns:
            unique_groups = df['Material Group'].astype(str).unique()  # Get unique values

            for group in unique_groups:
                st.subheader(f"Material Group {group} Analysis")

                # Filter data for the current Material Group
                df_filtered = df[df['Material Group'].astype(str) == str(group)]

                # Call the analysis functions
                df_more_filtered, top_n = order_placement_utils.overall_orderplacement_patterns(df_filtered)
                order_placement_utils.outlier_detection(df_more_filtered, top_n)
                # order_placement_utils.overall_order_patterns(df_filtered)
                # order_placement_utils.outlier_detection(df_filtered)
                # order_placement_utils.vendor_order_analysis(df_filtered)
                # order_placement_utils.order_trends_over_time(df_filtered)
                # order_placement_utils.monthly_order_patterns(df_filtered)
                # order_placement_utils.vendor_material_analysis(df_filtered)
                # order_placement_utils.plant_order_analysis(df_filtered)
                # order_placement_utils.purchasing_document_analysis(df_filtered)
                # order_placement_utils.order_quantity_distribution(df_filtered)
                # order_placement_utils.material_vendor_analysis(df_filtered)
                # order_placement_utils.supplier_order_analysis(df_filtered)
                # order_placement_utils.material_plant_analysis(df_filtered)
                # order_placement_utils.abc_analysis(df_filtered)
                order_placement_utils.specific_material_analysis(df_filtered)

    else:
        st.write("Please upload an Excel file to begin the analysis.")

# Goods Receipt Analysis File Uploader - Need to be adjusted for Streamlit custom component response
def goods_receipt_upload():
    uploaded_file = st.file_uploader("Upload Goods Receipt Excel File for Analysis", type="xlsx")
    if uploaded_file:
        df = data.load_data_GR(uploaded_file)  # Read the file

        # Check if 'Material Group' column exists
        if 'Material Group' in df.columns:
            unique_groups = df['Material Group'].astype(str).unique()  # Get unique values

            for group in unique_groups:
                st.subheader(f"Material Group {group} Analysis")

                # Filter data for the current Material Group
                df_filtered = df[df['Material Group'].astype(str) == str(group)]

                # Call the analysis functions
                df_more_filtered, top_n = goods_receipt_utils.overall_GR_patterns(df_filtered)
                goods_receipt_utils.outlier_detection(df_more_filtered, top_n)
                goods_receipt_utils.specific_material_analysis(df_filtered)

    else:
        st.write("Please upload an Excel file to begin the analysis.")

# Lead Time Analysis File Uploader - Need to be adjusted for Streamlit custom component response
def lead_time_upload():
    # File uploader
    uploaded_file_op = st.file_uploader("Upload Order Placement Excel File for Analysis", type="xlsx", key="op")
    uploaded_file_gr = st.file_uploader("Upload Goods Received Excel File for Analysis", type="xlsx", key="gr")
    uploaded_file_sr = st.file_uploader("Upload Modified Shortage Report Excel File for Analysis", type="xlsx", key="sr")

    if uploaded_file_op and uploaded_file_gr and uploaded_file_sr:
        with st.spinner("Processing lead time analysis..."):
            op_df = pd.read_excel(uploaded_file_op)
            gr_df = pd.read_excel(uploaded_file_gr)
            shortage_df = pd.read_excel(uploaded_file_sr)

            matched = lead_time_analysis.process_dataframes(op_df, gr_df)
            calculated_df = lead_time_analysis.calculate_actual_lead_time(matched)
            final_df = lead_time_analysis.calculate_lead_time_summary(shortage_df)
            final_result = lead_time_analysis.calculate_lead_time_differences(final_df, calculated_df)

            # Call the updated Plotly version of your function
            fig1, fig2, fig3, fig4 = lead_time_analysis.analyze_and_plot_lead_time_differences_plotly(final_result)

        st.success("Lead Time Analysis Completed ✅")
        st.write("### Lead Time Analysis Results:")
        st.plotly_chart(fig1, use_container_width=True)
        st.plotly_chart(fig2, use_container_width=True)
        st.plotly_chart(fig3, use_container_width=True)
        st.plotly_chart(fig4, use_container_width=True)
    else:
        st.write("Please upload all Excel files to begin the analysis.")
