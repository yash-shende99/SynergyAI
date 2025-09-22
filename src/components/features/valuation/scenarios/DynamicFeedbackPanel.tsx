import { FC } from 'react';
import { Scenario } from '../../../../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DynamicFeedbackPanel: FC<{ variables: Scenario['variables'] }> = ({ variables }) => {
    const estimatedImpact = (variables.revenueChange * 5) - (variables.cogsChange * 2); // Simple mock calculation
    const isPositive = estimatedImpact >= 0;
    return (
        <div className="mt-4 p-3 rounded-lg bg-background/50 border border-border/50">
            <h4 className="text-xs font-semibold text-secondary mb-2">Estimated Impact</h4>
            <div className="flex items-center gap-2">
                {isPositive ? <TrendingUp className="text-green-400"/> : <TrendingDown className="text-red-400"/>}
                <span className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    ${estimatedImpact.toFixed(1)}M
                </span>
            </div>
            <p className="text-xs text-secondary mt-1">Impact on estimated enterprise value.</p>
        </div>
    );
};
export default DynamicFeedbackPanel;