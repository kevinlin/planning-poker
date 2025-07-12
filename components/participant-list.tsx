import { Participant } from "@/lib/types";
import { isParticipantActive } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ParticipantListProps {
  participants: Participant[];
  currentParticipantId?: string;
  canRemove?: boolean;
  onRemoveParticipant?: (participantId: string) => void;
}

export function ParticipantList({
  participants,
  currentParticipantId,
  canRemove = false,
  onRemoveParticipant,
}: ParticipantListProps) {
  const activeParticipants = participants.filter(p => isParticipantActive(p.lastActivity));
  const inactiveParticipants = participants.filter(p => !isParticipantActive(p.lastActivity));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Participants</h3>
        <Badge variant="info">
          {activeParticipants.length} active
        </Badge>
      </div>
      
      <div className="space-y-2">
        {activeParticipants.map((participant) => (
          <div
            key={participant.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              participant.id === currentParticipantId
                ? 'bg-purple-50 border-purple-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{participant.name}</span>
              {participant.id === currentParticipantId && (
                <Badge variant="outline" className="text-xs">You</Badge>
              )}
            </div>
            
            {canRemove && participant.id !== currentParticipantId && onRemoveParticipant && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveParticipant(participant.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {inactiveParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200 opacity-60"
          >
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="font-medium text-gray-600">{participant.name}</span>
              <Badge variant="outline" className="text-xs text-gray-500">
                Inactive
              </Badge>
            </div>
            
            {canRemove && onRemoveParticipant && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveParticipant(participant.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {participants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No participants yet. Share the session code to invite others!
          </div>
        )}
      </div>
    </div>
  );
} 