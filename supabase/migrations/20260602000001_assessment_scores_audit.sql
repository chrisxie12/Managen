BEGIN;

CREATE TABLE IF NOT EXISTS assessment_scores_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_score_id UUID REFERENCES assessment_scores(id) ON DELETE CASCADE,
  old_score NUMERIC(5,2),
  new_score NUMERIC(5,2),
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_assessment_scores_audit_score_id ON assessment_scores_audit(assessment_score_id);

CREATE OR REPLACE FUNCTION audit_assessment_scores_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.score IS DISTINCT FROM NEW.score THEN
    INSERT INTO assessment_scores_audit (
      assessment_score_id, old_score, new_score, changed_by, changed_at
    ) VALUES (
      NEW.id, OLD.score, NEW.score, current_setting('request.jwt.claim.sub', true)::UUID, NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_audit_assessment_scores ON assessment_scores;
CREATE TRIGGER trigger_audit_assessment_scores
AFTER UPDATE ON assessment_scores
FOR EACH ROW
EXECUTE FUNCTION audit_assessment_scores_change();

COMMIT;
