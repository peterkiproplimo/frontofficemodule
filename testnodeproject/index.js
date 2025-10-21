// index.js

// Print a greeting message
console.log("✅ Node.js app started successfully!");

// Access an environment variable
const myEnvVar = process.env.MY_TEST_VARIABLE;

// Print it to the console
if (myEnvVar) {
  console.log("🌍 MY_TEST_VARIABLE value:", myEnvVar);
} else {
  console.log("⚠️ MY_TEST_VARIABLE is not set. Please define it in Render dashboard > Environment.");
}

// Optional: print all environment variables (for debugging only)
// console.log(process.env);
