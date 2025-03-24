import plotly.express as px
import pandas as pd
import streamlit as st
from app import page_builder
from app.utils.file_uploaders import material_consumption_upload

# Set the page config with the title centered
st.set_page_config(page_title="Micron | SupplySense", layout="wide")
st.html("""
    <style>
        header {visibility: hidden;}
        .stMainBlockContainer {
            padding: 0px;
        }
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
    </style>
    """
)

# TODO: Adjust this with the actual data processing and send the param to the iframe
df = px.data.iris()
fig = px.scatter(df, x="sepal_width", y="sepal_length", title="Sample Ini Gan")

# Page Header
# TODO: May need to think how to place the header properly

# File Uploader
material_consumption_upload()   # Material Consumption Analysis

# Analytics Dashboard
page_builder(fig)