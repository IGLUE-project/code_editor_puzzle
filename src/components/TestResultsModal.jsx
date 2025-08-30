// TestResultsModal.jsx
import Modal from "./Modal";

export default function TestResultsModal({ open, onClose, testResults, appSettings, sendSol, I18n }) {
  const passed = testResults.filter(r => r.status === "passed").length;
  const failed = testResults.filter(r => r.status === "failed").length;

  return (
    <Modal open={open} onClose={onClose} title={"Results" + (appSettings.showTests ? (" ("+ testResults.length + " tests)") : "")}>
      {appSettings.showTests && <div className="sp-tests-meta">
        {I18n.getTrans("i.Passed")}: <strong style={{ color: "var(--sp-green)" }}>{passed}</strong> | 
        &nbsp; {I18n.getTrans("i.Failed")}: <strong style={{ color: "var(--sp-red)" }}>{failed}</strong>
      </div>}

      {appSettings.showTests && testResults.map((result, i) => {
        const ok = result.status === "passed";
        return (
          <div key={i} className={`sp-test ${ok ? "sp-test--passed" : "sp-test--failed"}`}>
            <div className="sp-test__row">
              <span>{result.name}</span>
              <span className={`sp-badge ${ok ? "sp-badge--passed" : "sp-badge--failed"}`}>
                {result.status}
              </span>
            </div>
            {result.error && (
              <pre className="sp-error">{result.error}</pre>
            )}
          </div>
        );
      })}
        {testResults.length === 0 && (
                <div className="sp-tests-meta">{I18n.getTrans("i.noTestsYet")}</div>
            )}
        <div className="centered-results ">
            <h3 style={{ color: "var(--sp-green)" }}>{failed == 0 && (appSettings.allCorrectMessage || I18n.getTrans("i.allCorrectMessage"))}</h3>
            <h3 style={{ color: "var(--sp-red)" }}>{failed > 0 && (appSettings.someWrongMessage || I18n.getTrans("i.someWrongMessage"))}</h3>
      </div>
      <br/>
      <div class="sp-modal__footer">
        {failed > 0 && <button className="btn-continue is-danger" onClick={onClose}>{appSettings.tryAgainButtonText  || I18n.getTrans("i.tryAgainButtonText")}</button>}&nbsp;
        {failed == 0 && <button className="btn-continue is-success" onClick={sendSol}>{appSettings.continueButtonText  || I18n.getTrans("i.continueButtonText")}</button>}
    </div>

    </Modal>
  );
}
