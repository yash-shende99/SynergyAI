// components/SecuritySection.jsx
import React from 'react';
import { Shield, Lock, FileCheck, Users } from 'lucide-react';

const SecuritySection = () => {
  return (
    <div className="bg-gradient-to-b from-surface to-background py-16 md:py-24" id="security">
    <div className="px-4 sm:px-6 lg:px-8">

      <div className="section-container">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Enterprise-Grade <span className="bg-gradient-to-r from-synergy-ai-primary to-synergy-ai-purple-light bg-clip-text text-transparent">Security & Compliance</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Your data is protected with bank-level security and industry-leading compliance standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-surface rounded-xl p-6 text-center border border-border">
            <div className="bg-green-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">SOC 2 Certified</h3>
            <p className="text-gray-400 text-sm">Enterprise-grade security controls and protocols</p>
          </div>

          <div className="bg-surface rounded-xl p-6 text-center border border-border">
            <div className="bg-synergy-ai-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-synergy-ai-primary" />
            </div>
            <h3 className="font-semibold text-white mb-2">End-to-End Encryption</h3>
            <p className="text-gray-400 text-sm">Military-grade encryption for all data in transit and at rest</p>
          </div>

          <div className="bg-surface rounded-xl p-6 text-center border border-border">
            <div className="bg-synergy-ai-purple-light/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileCheck className="h-8 w-8 text-synergy-ai-purple-light" />
            </div>
            <h3 className="font-semibold text-white mb-2">GDPR Compliant</h3>
            <p className="text-gray-400 text-sm">Full compliance with global data protection regulations</p>
          </div>

          <div className="bg-surface rounded-xl p-6 text-center border border-border">
            <div className="bg-orange-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Role-Based Access</h3>
            <p className="text-gray-400 text-sm">Granular permissions and access controls for teams</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-8 border border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure Data Integration</h3>
              <p className="text-gray-400 mb-6">
                Integrate securely with your existing systems and data sources. 
                SynergyAI supports secure VDR integration, financial data providers, 
                and custom data connectors with full audit trails.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Secure VDR integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Financial data provider APIs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Custom data connectors</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Full audit trail & compliance</span>
                </div>
              </div>
            </div>
            <div className="bg-secondarySurface rounded-xl p-6 border border-border">
              <div className="text-center">
                <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h4 className="font-semibold text-white mb-2">Security First</h4>
                <p className="text-gray-400 text-sm">
                  All data is encrypted, isolated, and protected with multiple layers of security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SecuritySection;