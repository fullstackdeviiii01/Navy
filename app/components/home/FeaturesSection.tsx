// // app/components/home/FeaturesSection.tsx - FULLY RESPONSIVE
// import { FaTruck, FaShieldAlt, FaUndo, FaHeadset } from "react-icons/fa";

// export default function FeaturesSection() {
//   const features = [
//     {
//       icon: FaTruck,
//       title: "Free Shipping",
//       description: "On orders over $50",
//       color: "blue",
//     },
//     {
//       icon: FaShieldAlt,
//       title: "Secure Payment",
//       description: "100% secure transactions",
//       color: "green",
//     },
//     {
//       icon: FaUndo,
//       title: "Easy Returns",
//       description: "30-day return policy",
//       color: "purple",
//     },
//     {
//       icon: FaHeadset,
//       title: "24/7 Support",
//       description: "Dedicated customer service",
//       color: "orange",
//     },
//   ];

//   const colorClasses = {
//     blue: "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
//     green: "from-green-500 to-green-600 dark:from-green-600 dark:to-green-700",
//     purple:
//       "from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
//     orange:
//       "from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700",
//   };

//   return (
//     <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-gray-50 dark:bg-gray-800/50">
//       <div className="container mx-auto px-3 sm:px-4 md:px-6">
//         <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
//           {features.map((feature, index) => (
//             <div
//               role="region"
//               aria-label={feature.title}
//               key={index}
//               className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-theme-border-light dark:border-theme-border-dark"
//             >
//               <div className="flex flex-col items-center text-center">
//                 <div
//                   className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${
//                     colorClasses[feature.color as keyof typeof colorClasses]
//                   } flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}
//                 >
//                   <feature.icon
//                     className="text-white text-lg sm:text-xl md:text-2xl"
//                     aria-hidden="true"
//                   />
//                 </div>
//                 <h3 className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">
//                   {feature.title}
//                 </h3>
//                 <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm leading-relaxed">
//                   {feature.description}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
