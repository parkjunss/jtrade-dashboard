import AuthPrompt from './AuthPrompt.jsx';

export default function ProtectedRoutePreview({ children }) {
  return (
    <div className="protected-route-preview">
      <div className="protected-route-content" aria-hidden="true">
        {children}
      </div>
      <div className="protected-route-overlay">
        <AuthPrompt
          message="This preview is blurred because it contains private portfolio data. Sign in to view the full workspace."
          title="Sign in to view"
        />
      </div>
    </div>
  );
}
