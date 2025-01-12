import { GoogleGenerativeAI } from "@google/generative-ai";

export const gemeniResponse = async ({image, arrayOfString ,key} : {image : string , arrayOfString : string[] , key : string}) => {
  const genAI = new GoogleGenerativeAI("AIzaSyA8x67CseMpIUl9ZT3ILLMTbxIze-JKtdQ");

  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

  const prompt = `You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them. Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right). Parentheses have the highest priority, followed by Exponents, then Multiplication and Division, and lastly Addition and Subtraction. 

  For example:
  Q. 2 + 3 * 4 (3 * 4) => 12, 2 + 12 = 14. 
  Q. 2 + 3 + 5 * 4 - 8 / 2 
  5 * 4 => 20, 8 / 2 => 4, 2 + 3 => 5, 5 + 20 => 25, 25 - 4 => 21.
  
  YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME:
  
  Following are the cases:
  1. Simple mathematical expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc.: In this case, solve and return the answer in the format of a LIST OF ONE OBJECT {'expr': 'given expression', 'result': 'calculated answer'}. If there are SI units involved, include them in the result.
  
  2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, 5x^2 + 6y + 7 = 12, etc.: In this case, solve for the given variable, and the format should be an ARRAY OF OBJECTS, with each object structured as {'expr': 'variable name', 'result': 'calculated value', 'assign': true}. Include as many objects as there are variables.
  
  3. Assigning values to variables like x = 4, y = 5, z = 6, etc.: In this case, assign values to variables and include the key 'assign': true in the output, structured as {'expr': 'variable name', 'result': 'assigned value', 'assign': true}. Return as an ARRAY OF OBJECTS.
  
  4. Analyzing Graphical Math problems, which are word problems represented in drawing form, such as cars colliding, trigonometric problems, problems on the Pythagorean theorem, adding runs from a cricket wagon wheel, etc. These will have a drawing representing some scenario and accompanying information with the image. PAY CLOSE ATTENTION TO DIFFERENT COLORS FOR THESE PROBLEMS. Return the answer as a LIST OF ONE OBJECT {'expr': 'problem description', 'result': 'calculated answer'}.
  
  5. Detecting Abstract Concepts that a drawing might show, such as love, hate, jealousy, patriotism, or a historic reference to war, invention, discovery, quote, etc.: Use the same format as others to return the answer, where 'expr' will be the explanation of the drawing, and 'result' will be the abstract concept.
  
  so result is going to be something like this [{'expr': 'A', 'result': 40, 'assign': true}, {'expr': 'B', 'result': 30, 'assign': true}] so that it can be parsed with JSON.parse javascript method and then used in your code.

  Analyze the equation or expression in this image and return the answer according to the given rules. Make sure the output is strictly in a valid JavaScript JSON format, directly parsable using JSON.parse. Do not use backticks, markdown formatting, or unnecessary escaping. For example: [{'expr': 'A', 'result': 40, 'assign': true}, {'expr': 'B', 'result': 30, 'assign': true}]. Here is a dictionary of user-assigned variables. If the given expression has any of these variables, use its actual value from this dictionary accordingly: ${JSON.stringify(arrayOfString)}.`;
  
  
  const result = await model.generateContent([
    {
      inlineData: {
        data: image,
        mimeType: "image/jpeg",
      },
    },
    prompt,
  ]);

  return result;
};
