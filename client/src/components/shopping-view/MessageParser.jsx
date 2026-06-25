class MessageParser {
    constructor(actionProvider) {
      this.actionProvider = actionProvider;
    }
  
    parse(message) {
      // Here, you can define how the bot should respond to different user inputs
      const lowerCaseMessage = message.toLowerCase();
  
      if (lowerCaseMessage.includes("product")) {
        this.actionProvider.handleProductQuery();
      } else if (lowerCaseMessage.includes("add to cart")) {
        const product = { name: "T-Shirt" }; // Example product data
        this.actionProvider.handleAddToCart(product);
      } else if (lowerCaseMessage.includes("checkout")) {
        this.actionProvider.handleCheckout();
      }
    }
  }
  
  export default MessageParser;
  