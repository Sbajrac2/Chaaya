// import React from "react";
// import { useLocation } from "wouter";
// import { Heart, Brain, Moon, Sun, Sparkles, ArrowRight } from "lucide-react";

// export function WelcomePage() {
//   const [, setLocation] = useLocation();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-900 text-white overflow-y-auto">
//       {/* Hero Section */}
//       <div className="flex flex-col items-center justify-center min-h-screen p-8">
//         <div className="max-w-4xl text-center">
//           <div className="mb-6">
//             <Sparkles className="w-12 h-12 text-violet-300 mx-auto mb-4" />
//             <p className="text-sm uppercase tracking-widest text-violet-300 mb-2">Welcome to</p>
//           </div>

//           <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-violet-200 via-purple-200 to-indigo-200 bg-clip-text text-transparent">
//             Chaaya
//           </h1>

//           <p className="text-xl md:text-2xl text-violet-100 mb-4 leading-relaxed">
//             Your shadow knows before you do
//           </p>

//           <p className="text-lg md:text-xl text-violet-200 mb-12 max-w-2xl mx-auto leading-relaxed">
//             A mindfulness companion that helps you tune into your rhythms, reflect on your daily patterns,
//             and discover insights about your mental well-being through gentle, intuitive interactions.
//           </p>

//           <button
//             onClick={() => setLocation("/start")}
//             className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//           >
//             <span className="flex items-center gap-2">
//               Begin Your Journey
//               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//             </span>
//           </button>
//         </div>
//       </div>

//       {/* Features Section */}
//       <div className="py-20 px-8">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-violet-100">
//             Discover Your Inner Rhythms
//           </h2>

//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
//               <Heart className="w-12 h-12 text-pink-400 mx-auto mb-6" />
//               <h3 className="text-xl font-semibold mb-4 text-violet-100">Emotional Awareness</h3>
//               <p className="text-violet-200 leading-relaxed">
//                 Track your emotional patterns through daily check-ins and discover what influences your mood and well-being.
//               </p>
//             </div>

//             <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
//               <Brain className="w-12 h-12 text-blue-400 mx-auto mb-6" />
//               <h3 className="text-xl font-semibold mb-4 text-violet-100">Pattern Recognition</h3>
//               <p className="text-violet-200 leading-relaxed">
//                 Uncover hidden patterns in your behavior, sleep, and daily habits that affect your mental health journey.
//               </p>
//             </div>

//             <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
//               <Moon className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
//               <h3 className="text-xl font-semibold mb-4 text-violet-100">Mindful Reflection</h3>
//               <p className="text-violet-200 leading-relaxed">
//                 Engage in gentle, guided reflections that help you process your experiences and build resilience.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Quote Section */}
//       <div className="py-20 px-8">
//         <div className="max-w-4xl mx-auto text-center">
//           <blockquote className="text-2xl md:text-3xl font-light italic text-violet-200 mb-8 leading-relaxed">
//             "The meeting of two personalities is like the contact of two chemical substances:
//             if there is any reaction, both are transformed."
//           </blockquote>
//           <cite className="text-lg text-violet-300 font-medium">
//             — Carl Jung
//           </cite>
//         </div>
//       </div>

//       {/* Call to Action */}
//       <div className="py-20 px-8">
//         <div className="max-w-2xl mx-auto text-center">
//           <Sun className="w-16 h-16 text-yellow-400 mx-auto mb-8" />
//           <h2 className="text-3xl md:text-4xl font-bold mb-6 text-violet-100">
//             Ready to Begin?
//           </h2>
//           <p className="text-lg text-violet-200 mb-8 leading-relaxed">
//             Take the first step towards greater self-awareness. Your journey of discovery starts here.
//           </p>

//           <button
//             onClick={() => setLocation("/start")}
//             className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//           >
//             <span className="flex items-center gap-2">
//               Start Exploring
//               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//             </span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
