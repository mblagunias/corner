export function ListeningConsole() {
  return (
    <div className="listening-console">
      <div className="console-surface">
        <div className="console-turntable">
          <div className="turntable-base">
            <div className="turntable-platter" aria-hidden="true" />
            <div className="turntable-arm" aria-hidden="true" />
          </div>
        </div>

        <div className="console-plant">
          <div className="plant-pot">
            <div className="plant-stem" aria-hidden="true">
              <span className="plant-leaf plant-leaf-1" />
              <span className="plant-leaf plant-leaf-2" />
              <span className="plant-leaf plant-leaf-3" />
            </div>
          </div>
        </div>

        <div className="console-lamp">
          <div className="lamp-shade" aria-hidden="true" />
          <div className="lamp-stem" aria-hidden="true" />
          <div className="lamp-base" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
