export interface OrderState {
  drink: boolean;
  size: boolean;
  milk: boolean;
  name: boolean;
}

export const getBaristaResponse = (state: OrderState): string => {
  if (!state.drink) {
    return "Welcome in! What can I get started for you today?";
  }
  
  if (!state.size) {
    return "What size would you like that in?";
  }
  
  if (!state.milk) {
    return "Would you like any milk or creamer with that?";
  }
  
  if (!state.name) {
    return "Can I get a name for your order?";
  }
  
  return "Great! I'll have that ready for you at the end of the counter. Thank you!";
};