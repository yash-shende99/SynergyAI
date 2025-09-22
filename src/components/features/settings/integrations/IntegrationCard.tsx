import { FC } from 'react';
import {Button} from '../../../ui/button';

interface IntegrationCardProps {
  name: string;
  description: string;
  logoUrl: string;
  isConnected: boolean;
}

const IntegrationCard: FC<IntegrationCardProps> = ({ name, description, logoUrl, isConnected }) => (
    <div className="p-4 rounded-lg border border-border bg-background/50 flex flex-col items-start">
        <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-white rounded-lg p-1.5 flex items-center justify-center">
                <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-contain"/>
            </div>
            <h4 className="font-bold text-white">{name}</h4>
        </div>
        <p className="text-xs text-secondary flex-1 mb-4">{description}</p>
        {isConnected ? (
            <div className="w-full flex justify-between items-center text-xs">
                <span className="text-green-400 font-semibold">Connected</span>
                <button className="text-secondary hover:text-white">Disconnect</button>
            </div>
        ) : (
            <Button variant="secondary" size="sm" className="w-full">Connect</Button>
        )}
    </div>
);
export default IntegrationCard;