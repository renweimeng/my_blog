import { ListTree } from 'lucide-react';
import { makeRecentEvents } from '../../data/demoData';
import type { DemoSnapshot } from '../../data/demoData';
import { Panel } from './Panel';

interface EventStreamProps {
  snapshot: DemoSnapshot;
}

export default function EventStream({ snapshot }: EventStreamProps) {
  const events = makeRecentEvents(snapshot);
  return (
    <Panel
      title="最近事件流"
      eyebrow="Realtime event stream"
      action={
        <span className="mini-label">
          <ListTree size={13} />
          {events.length} events
        </span>
      }
      className="event-stream-card"
    >
      <div className="research-event-list">
        {events.map((event) => (
          <div key={event.id} className={`research-event ${event.severity}`}>
            <span>{event.time}</span>
            <p>{event.message}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
