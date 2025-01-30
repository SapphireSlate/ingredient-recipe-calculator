# Recipe Calculator

A web application for calculating recipe ingredient quantities based on serving size adjustments. Available in both JavaScript and TypeScript versions.

## Live Demo
Visit the application at: https://sapphireslate.github.io/ingredient-recipe-calculator/

Choose between:
- [JavaScript Version](https://sapphireslate.github.io/ingredient-recipe-calculator/javascript/)
- [TypeScript Version](https://sapphireslate.github.io/ingredient-recipe-calculator/typescript/)

## Project Structure
The project maintains two versions:
- Main branch (JavaScript): Traditional React implementation
- gh-pages-typescript branch: TypeScript implementation with enhanced type safety

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/SapphireSlate/ingredient-recipe-calculator.git
cd ingredient-recipe-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Building and Deployment

### Local Build
```bash
# For JavaScript version
npm run build

# For TypeScript version (on gh-pages-typescript branch)
PUBLIC_URL=/ingredient-recipe-calculator/typescript npm run build
```

### GitHub Pages Deployment
The project uses GitHub Actions for automated deployment to GitHub Pages. The workflow:
1. Builds both JavaScript and TypeScript versions
2. Creates a version selector landing page
3. Deploys everything to the gh-pages branch

#### Troubleshooting Deployment Issues

1. **Public Path Configuration**
   - JavaScript build requires: `PUBLIC_URL=/ingredient-recipe-calculator/javascript`
   - TypeScript build requires: `PUBLIC_URL=/ingredient-recipe-calculator/typescript`
   - Webpack config must use the environment variable for publicPath

2. **Git Repository Structure**
   - The deployment workflow creates a new git repository in the `dist` directory
   - Both versions are copied to their respective subdirectories
   - Git user configuration is required for deployment actions

3. **Common Issues**
   - "fatal: not in a git directory": Ensure git is initialized in the deployment directory
   - Incorrect routing: Check public path configuration in both builds
   - Build output location: Verify correct paths in workflow copy commands

## Implementation Notes

### JavaScript Version
- Uses Create React App
- Implements core recipe calculation functionality
- Maintains simple state management

### TypeScript Version
- Enhanced with type safety
- Uses webpack for building
- Requires proper public path configuration for deployment

## Future Updates
When implementing updates:
1. Make changes in both JavaScript and TypeScript versions
2. Test builds locally with correct public paths
3. Verify changes in both versions before deployment
4. Update workflow if build configuration changes

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Features

- Calculate recipe costs based on ingredient prices
- Manage ingredient inventory and costs
- User-friendly interface with modern design
- Responsive layout for all devices
- Real-time cost calculations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- SapphireSlate

## 🙏 Acknowledgments

- [Create React App](https://github.com/facebook/create-react-app)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
