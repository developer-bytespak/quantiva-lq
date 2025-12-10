import React from 'react'

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Sign Up',
      description:
        'Create your account in minutes with our simple registration process.',
      icon: '👤',
    },
    {
      number: '02',
      title: 'Choose Your Plan',
      description:
        'Select the plan that best fits your trading needs and goals.',
      icon: '📦',
    },
    {
      number: '03',
      title: 'Connect Your Account',
      description:
        'Securely connect your trading account or start with our demo.',
      icon: '🔗',
    },
    {
      number: '04',
      title: 'Start Trading',
      description:
        'Begin trading with our advanced tools and analytics at your fingertips.',
      icon: '🚀',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in four simple steps
          </p>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-5xl">{step.icon}</span>
                    <span className="text-4xl font-bold text-blue-600 opacity-20">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-400 text-2xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

