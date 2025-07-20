import { useState, useEffect, useCallback } from "react";

// --- Helper Components ---

// A simple loading spinner component
const Spinner = () => (
  <div className="spinner w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
);

// --- Main App Component ---

export default function App() {
  // --- State Management ---
  const [riddle, setRiddle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState({ message: "", color: "" });
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [guessCount, setGuessCount] = useState(0);
  const [hint, setHint] = useState("");

  const API_URL = "https://riddles-api.vercel.app/random";

  // --- Data Fetching ---
  const fetchRiddle = useCallback(async () => {
    setIsLoading(true);
    setFeedback({ message: "", color: "" });
    setIsAnswered(false);
    setUserAnswer("");
    setGuessCount(0); // Reset guess count for new riddle
    setHint(""); // Reset hint for new riddle

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRiddle(data);
    } catch (error) {
      console.error("Error fetching riddle:", error);
      setFeedback({
        message: "Oops! Could not fetch a riddle.",
        color: "text-red-500",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch the first riddle on component mount
  useEffect(() => {
    fetchRiddle();
  }, [fetchRiddle]);

  // --- Event Handlers ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      setFeedback({
        message: "Please enter an answer!",
        color: "text-yellow-500",
      });
      return;
    }

    const isCorrect =
      userAnswer.trim().toLowerCase() === riddle.answer.toLowerCase();

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
      setFeedback({ message: "Correct!", color: "text-green-500" });
      setIsAnswered(true);
    } else {
      const newGuessCount = guessCount + 1;
      setGuessCount(newGuessCount);
      setUserAnswer(""); // Clear input for the next guess
      if (newGuessCount >= 3) {
        setFeedback({
          message: "You have used all your guesses.",
          color: "text-red-500",
        });
      } else {
        setFeedback({
          message: `Not quite! You have ${3 - newGuessCount} guesses left.`,
          color: "text-orange-500",
        });
      }
    }
  };

  const handleHint = () => {
    if (riddle?.answer) {
      const firstLetter = riddle.answer[0];
      const wordCount = riddle.answer.split(" ").length;
      setHint(
        `Hint: It's ${wordCount} word(s) and starts with "${firstLetter.toUpperCase()}".`
      );
    }
  };

  const handleShowAnswer = () => {
    setIsAnswered(true);
    setFeedback({
      message: `The answer is: ${riddle.answer}`,
      color: "text-blue-500",
    });
  };

  const handleNextRiddle = () => {
    fetchRiddle();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isAnswered) {
      handleSubmit(e);
    }
  };

  // --- Render ---
  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-screen p-4 font-sans">
      <style>{`
                body { font-family: 'Inter', sans-serif; }
                .kalam-font { font-family: 'Kalam', cursive; }
                .card {
                    background-color: #ffffff;
                    border-radius: 1.5rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    transition: transform 0.3s ease-in-out;
                }
                .card:hover { transform: translateY(-5px); }
                .btn { transition: all 0.3s ease; }
                .btn:hover { transform: translateY(-2px); }
                .feedback { transition: all 0.5s ease-in-out; }
            `}</style>

      <div className="card w-full max-w-lg p-6 md:p-10 text-center dark:bg-gray-800 relative">
        <header className="mb-8">
          <h1 className="kalam-font text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400">
            Riddle Me This!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Test your wit and wisdom.
          </p>
        </header>

        <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 text-lg font-semibold px-4 py-2 rounded-full dark:bg-indigo-900 dark:text-indigo-200">
          Score: <span>{score}</span>
        </div>

        <main className="min-h-[150px] flex items-center justify-center mb-6">
          {isLoading ? (
            <Spinner />
          ) : (
            <p className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200">
              {riddle?.riddle}
            </p>
          )}
        </main>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your answer..."
              disabled={isAnswered || isLoading || guessCount >= 3}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 disabled:opacity-50"
            />
          </div>

          {/* Hint and Show Answer Buttons */}
          <div className="flex justify-center items-center gap-4 mb-4 min-h-[40px]">
            {!isAnswered && (
              <button
                type="button"
                onClick={handleHint}
                disabled={!!hint || isLoading}
                className="btn bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                Get Hint
              </button>
            )}
            {guessCount >= 3 && !isAnswered && (
              <button
                type="button"
                onClick={handleShowAnswer}
                className="btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg"
              >
                Show Answer
              </button>
            )}
          </div>

          {/* Hint Display Area */}
          {hint && !isAnswered && (
            <div className="mb-4 text-yellow-600 dark:text-yellow-400 font-semibold">
              <p>{hint}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAnswered ? (
              <button
                type="submit"
                disabled={isLoading || guessCount >= 3}
                className="btn w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg disabled:bg-indigo-400 disabled:opacity-50"
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextRiddle}
                className="btn w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg text-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
              >
                Next Riddle
              </button>
            )}
          </div>
        </form>

        <div
          className={`feedback mt-6 min-h-[3rem] text-2xl font-bold ${
            feedback.color
          } ${feedback.message ? "opacity-100" : "opacity-0"}`}
        >
          {feedback.message}
        </div>
      </div>
    </div>
  );
}
