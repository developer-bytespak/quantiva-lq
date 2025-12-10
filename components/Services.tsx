import React from 'react'

const Services: React.FC = () => {
  const services = [
    {
      title: 'Trading Analytics',
      description: 'Advanced analytics and insights to optimize your trading strategies.',
      icon: '📊',
    },
    {
      title: 'Risk Management',
      description: 'Comprehensive risk assessment and management tools.',
      icon: '🛡️',
    },
    {
      title: 'Real-time Data',
      description: 'Access to real-time market data and updates.',
      icon: '⚡',
    },
    {
      title: 'Portfolio Optimization',
      description: 'AI-powered portfolio optimization recommendations.',
      icon: '🎯',
    },
  ]

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions tailored to meet your trading needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services

