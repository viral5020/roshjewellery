class ActionProvider {
    constructor(createChatBotMessage, setStateFunc, createClientMessage) {
      this.createChatBotMessage = createChatBotMessage;
      this.setState = setStateFunc;
      this.createClientMessage = createClientMessage;
    }
  
    handleProductQuery = () => {
      const productQueryMessage = this.createChatBotMessage("What kind of fashion products are you looking for?");
      this.setState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, productQueryMessage],
      }));
    };
  
    handleAddToCart = (product) => {
      const addToCartMessage = this.createChatBotMessage(
        `I have added ${product.name} to your shopping cart. Would you like to continue shopping?`
      );
      this.setState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, addToCartMessage],
      }));
    };
  
    handleCheckout = () => {
      const checkoutMessage = this.createChatBotMessage("You can proceed to checkout from here.");
      this.setState((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, checkoutMessage],
      }));
    };
  }
  
  export default ActionProvider;
  