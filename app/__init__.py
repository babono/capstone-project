import os
import streamlit.components.v1 as components
from plotly.graph_objects import Figure

# Create a _RELEASE constant. We'll set this to False while we're developing
# the component, and True when we're ready to package and distribute it.
# (This is, of course, optional - there are innumerable ways to manage your
# release process.)

_RELEASE = False

# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component. We're naming this
# function "_component_func", with an underscore prefix, because we don't want
# to expose it directly to users. Instead, we will create a custom wrapper
# function, below, that will serve as our component's public API.

# It's worth noting that this call to `declare_component` is the
# *only thing* you need to do to create the binding between Streamlit and
# your component frontend. Everything else we do in this file is simply a
# best practice.

if not _RELEASE:
    _component_func = components.declare_component(
        "supply-sense",
        # Pass `url` here to tell Streamlit that the component will be served
        # by the local dev server that you run via `npm run start`.
        # (This is useful while your component is in development.)
        url="http://localhost:3000",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "../.next")
    _component_func = components.declare_component("supply-sense", path=build_dir)

# Wrapper function that serves as the public API of our component.
# This function will be called from the main Streamlit script.

# TODO: Adjust the parameter to use the actual information
def page_builder(fig: Figure):
    # Sending the data to be loaded in the React component
    spec = fig.to_json()
    component_value = _component_func(spec=spec, default=None)
    return component_value
