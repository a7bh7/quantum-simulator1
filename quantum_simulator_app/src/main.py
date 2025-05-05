import sys
import os

# Ensure the src directory is in the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask
from src.routes.main_routes import main_bp

def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__, template_folder='templates', static_folder='static')
    app.config['SECRET_KEY'] = os.urandom(24) # For session management, etc.

    # Register blueprints
    app.register_blueprint(main_bp)

    # Add a simple check route
    @app.route('/health')
    def health_check():
        return "OK", 200

    return app

if __name__ == '__main__':
    app = create_app()
    # Note: For deployment, use a production WSGI server like Gunicorn or Waitress
    # The host '0.0.0.0' makes the server accessible externally within the sandbox/network
    app.run(host='0.0.0.0', port=5000, debug=True) # debug=True for development only

