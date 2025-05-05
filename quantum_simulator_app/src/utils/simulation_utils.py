import random
import numpy as np

def predict_quantum_behavior_mock(params):
    """ 
    Simulates the prediction of quantum behavior based on input parameters.
    This is a mock function to be replaced when the actual model is available.

    Args:
        params (dict): A dictionary containing simulation parameters like 
                       'slit_distance', 'electron_energy', 'observation_intensity', etc.

    Returns:
        dict: A dictionary containing the predicted results:
              'predicted_behavior' (str): 'Wave' or 'Particle'.
              'wave_probability' (float): Probability of wave behavior (0.0 to 1.0).
              'particle_probability' (float): Probability of particle behavior (0.0 to 1.0).
              'pattern_x' (list): X-coordinates for the interference pattern graph.
              'pattern_y' (list): Y-coordinates (intensity) for the interference pattern graph.
    """
    # Simple mock logic: Higher observation intensity biases towards particle behavior
    observation_intensity = params.get('observation_intensity', 0.5)
    
    # Calculate probabilities based on observation intensity (simple linear relationship for mock)
    particle_prob = min(max(observation_intensity * 0.8 + random.uniform(-0.1, 0.1), 0), 1) # Add some randomness
    wave_prob = 1.0 - particle_prob

    predicted_behavior = 'Particle' if particle_prob > 0.5 else 'Wave'

    # Generate mock interference pattern data
    # If wave-like, show interference; if particle-like, show two peaks
    x_pattern = list(np.linspace(-10, 10, 200)) # Simulate screen positions
    y_pattern = []

    if predicted_behavior == 'Wave':
        # Simulate interference pattern (e.g., using cosine squared)
        slit_distance = params.get('slit_distance', 1.25)
        screen_distance = params.get('screen_distance', 30)
        # A very simplified model for wave interference intensity
        intensity_factor = (np.cos(np.array(x_pattern) * slit_distance / screen_distance * np.pi / 2))**2 
        noise = np.random.normal(0, 0.05, len(x_pattern)) # Add some noise
        y_pattern = list(np.clip(intensity_factor * 100 + noise * 10, 0, 100))
    else:
        # Simulate particle pattern (e.g., two Gaussian peaks)
        peak1 = np.exp(-((np.array(x_pattern) - 2)**2) / (2 * 1**2)) # Peak around x=2
        peak2 = np.exp(-((np.array(x_pattern) + 2)**2) / (2 * 1**2)) # Peak around x=-2
        noise = np.random.normal(0, 0.05, len(x_pattern))
        y_pattern = list(np.clip((peak1 + peak2) * 50 + noise * 10, 0, 100))

    return {
        'predicted_behavior': predicted_behavior,
        'wave_probability': wave_prob,
        'particle_probability': particle_prob,
        'pattern_x': x_pattern,
        'pattern_y': y_pattern
    }

# Example usage (for testing)
if __name__ == '__main__':
    test_params = {
        'slit_distance': 1.0,
        'electron_energy': 50,
        'observation_intensity': 0.1, # Low observation -> expect Wave
        'screen_distance': 20,
        'medium_temperature': 15
    }
    prediction_low_obs = predict_quantum_behavior_mock(test_params)
    print("Low Observation Prediction:", prediction_low_obs)

    test_params['observation_intensity'] = 0.9 # High observation -> expect Particle
    prediction_high_obs = predict_quantum_behavior_mock(test_params)
    print("\nHigh Observation Prediction:", prediction_high_obs)

