# Binary Tree Maximum Path Sum - Interactive Visualizer

An interactive visualization tool for understanding and learning the [Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/?envType=problem-list-v2&envId=depth-first-search) algorithm (LeetCode Problem 124).

## 🎯 About

This visualizer helps you understand one of the most challenging tree problems on LeetCode by providing step-by-step visual feedback of the Depth-First Search (DFS) algorithm as it computes the maximum path sum in a binary tree.

**Problem Statement**: Given a binary tree, find the maximum path sum. A path is defined as any sequence of nodes from some starting node to any node in the tree along the parent-child connections. The path must contain at least one node and does not need to go through the root.

## ✨ Features

- **Step-by-Step Visualization**: Watch the algorithm traverse the tree node by node
- **Interactive Controls**:
  - ▶️ Play/Pause animation
  - ⏭️ Step forward through each computation
  - ⏮️ Step backward to review previous steps
  - 🔄 Reset to start over
- **Real-Time Information**:
  - See left and right gains being computed
  - Watch global maximum updates
  - View the final maximum path highlighted
- **Custom Input**: Enter your own test cases using LeetCode array format
- **Pre-loaded Examples**: Multiple examples from simple to complex trees
- **Adjustable Speed**: Control animation speed to match your learning pace
- **Visual Feedback**:
  - Active node highlighting during traversal
  - Best path edges highlighted in green
  - Detailed step information display

## 🌐 Live Demo

🔗 **[Try it live on GitHub Pages!](https://froredion.github.io/binary-tree-max-sum-visualizer)**

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Froredion/binary-tree-max-sum-visualizer.git
cd binary-tree-max-sum-visualizer
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 How to Use

### Basic Usage

1. **Enter a Tree**: Input a binary tree using LeetCode's level-order array format
   - Example: `[-10,9,20,null,null,15,7]`
   - Use `null` for missing nodes
2. **Build Tree**: Click the "Build Tree" button to construct the tree

3. **Start Visualization**: Click "Start" to begin the animated algorithm

4. **Control Playback**:

   - **Start**: Begin automatic playback
   - **Pause**: Pause the animation
   - **Step**: Move forward one step at a time
   - **Back**: Go back to previous step
   - **Reset**: Return to the beginning

5. **Adjust Speed**: Use the speed slider to control animation tempo

### Input Format

The visualizer accepts binary trees in LeetCode's level-order traversal format with `null` for missing nodes:

- `[1,2,3]` - Simple balanced tree
- `[-10,9,20,null,null,15,7]` - LeetCode example 1
- `[2,-1]` - Simple two-node tree
- `[9,6,-3,null,null,-6,2,null,null,2,null,-6,-6,-6]` - Complex example

## 🧮 Algorithm Explanation

### How It Works

The algorithm uses **Depth-First Search (DFS)** with a clever gain computation strategy:

1. **Base Case**: Empty nodes contribute 0 to any path

2. **Recursive Step**: For each node, compute:

   - `leftGain = max(0, dfs(left))` - Maximum gain from left subtree (ignore if negative)
   - `rightGain = max(0, dfs(right))` - Maximum gain from right subtree (ignore if negative)

3. **Local Maximum**: Consider path passing through current node:

   - `maxThroughNode = node.val + leftGain + rightGain`
   - Update global maximum if this is better

4. **Return Value**: Return to parent the maximum single-branch path:
   - `return node.val + max(leftGain, rightGain)`
   - Only one branch can continue up to the parent

### Key Insights

- **Negative Clamping**: We use `max(0, gain)` to ignore negative paths
- **Local vs Global**: Each node considers a path through itself (both children) for the global max, but only returns a single branch to its parent
- **Path Definition**: A path can start and end at any nodes - it doesn't need to include the root

### Complexity

- **Time Complexity**: O(n) - visits each node once
- **Space Complexity**: O(h) - recursion stack depth, where h is tree height

## 🛠️ Technology Stack

- **[React](https://reactjs.org/)** - UI framework for building the interactive interface
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript for better code quality
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for styling
- **SVG** - Scalable Vector Graphics for tree rendering
- **[Create React App](https://create-react-app.dev/)** - Build toolchain

## 📝 Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run deploy` - Deploys the app to GitHub Pages
- `npm run eject` - Ejects from Create React App (one-way operation)

## 🚀 Deployment

This project is configured for easy deployment to GitHub Pages.

**Quick Deploy:**

```bash
npm run deploy
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! Here are some ways you can contribute:

- Report bugs or issues
- Suggest new features or improvements
- Submit pull requests
- Improve documentation
- Share the project with others learning algorithms

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This means you can freely use, modify, and distribute this software.

## 🙏 Acknowledgments

- Problem inspired by [LeetCode Problem 124](https://leetcode.com/problems/binary-tree-maximum-path-sum/)
- Built for developers learning algorithms and data structures
- Special thanks to the LeetCode community for problem discussions and insights

## 🔗 Related Resources

- [LeetCode Problem 124](https://leetcode.com/problems/binary-tree-maximum-path-sum/?envType=problem-list-v2&envId=depth-first-search)
- [Binary Tree Algorithms](https://leetcode.com/tag/tree/)
- [Depth-First Search Problems](https://leetcode.com/tag/depth-first-search/)

## 📧 Contact

Have questions or suggestions? Feel free to open an issue or reach out!

---

⭐ If you find this visualizer helpful, please consider giving it a star on GitHub!
