# Ingredient Recipe Calculator

A React-based application for calculating recipe costs and managing ingredient prices.

## Features

- Recipe cost calculation
- Ingredient price management
- Overhead cost tracking
- Recipe scaling functionality
- Modern UI with TailwindCSS

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SapphireSlate/ingredient-recipe-calculator.git
cd ingredient-recipe-calculator
```

2. Clean installation (if you encounter any issues):
```bash
Remove-Item -Path node_modules,package-lock.json -Force -Recurse -ErrorAction SilentlyContinue
npm cache clean --force
npm install react-scripts@5.0.1 --save
npm install --legacy-peer-deps
```

3. Regular installation (if no issues):
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will open in your default browser at [http://localhost:3000](http://localhost:3000).

## Development Notes

- The v2 branch is the main development branch
- The experimental features branch has been deprecated and archived
- Uses TailwindCSS for styling
- React 18 with modern hooks and patterns

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
