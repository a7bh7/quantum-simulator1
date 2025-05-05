from flask import Blueprint, render_template, request, jsonify
from src.utils.simulation_utils import predict_quantum_behavior_mock # Import the mock function

# Create a Blueprint for the main routes
main_bp = Blueprint(
    'main_bp',
    __name__,
    template_folder='../templates', # Specify the template folder relative to the blueprint file
    static_folder='../static' # Specify the static folder relative to the blueprint file
)

@main_bp.route('/')
def index():
    """Render the landing page."""
    return render_template('index.html', title='Quantum AI Simulator')

@main_bp.route('/simulation')
def simulation():
    """Render the simulation page."""
    return render_template('simulation.html', title='Run Simulation')

@main_bp.route('/about')
def about():
    """Render the about page."""
    return render_template('about.html', title='About the Project')

# --- API Endpoint for Prediction ---
@main_bp.route('/predict', methods=['POST'])
def predict():
    """Handle prediction requests from the frontend."""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    print(f"Received data for prediction: {data}") # Log received data for debugging

    # Validate required parameters (optional but good practice)
    required_params = ['slit_distance'
                       , 'electron_energy'
                       , 'observation_intensity'
                       , 'screen_distance'
                       , 'medium_temperature']
    if not all(param in data for param in required_params):
        return jsonify({"error": "Missing required simulation parameters"}), 400

    try:
        # Call the mock prediction function
        prediction_results = predict_quantum_behavior_mock(data)
        print(f"Prediction result: {prediction_results['predicted_behavior']}") # Log prediction
        return jsonify(prediction_results)
    except Exception as e:
        print(f"Error during prediction: {e}") # Log the error
        return jsonify({"error": "An error occurred during prediction"}), 500

