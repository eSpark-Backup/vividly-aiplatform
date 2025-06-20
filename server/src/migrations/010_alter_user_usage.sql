-- Add the new column for humanization
ALTER TABLE user_usage_metric
ADD COLUMN humanization_id text;

-- Drop existing type check constraint (adjust the name if needed)
ALTER TABLE user_usage_metric
DROP CONSTRAINT user_usage_metric_type_check;

-- Add updated type check constraint including 'humanization'
ALTER TABLE user_usage_metric
ADD CONSTRAINT user_usage_metric_type_check
CHECK (type IN ('image_generation', 'image_analysis', 'humanization'));

-- Drop the existing logical constraint
ALTER TABLE user_usage_metric
DROP CONSTRAINT only_one_image_type;

-- Add new logical constraint including humanization
ALTER TABLE user_usage_metric
ADD CONSTRAINT only_one_usage_type CHECK (
    (type = 'image_generation' AND image_generation_id IS NOT NULL AND image_analysis_id IS NULL AND humanization_id IS NULL) OR
    (type = 'image_analysis' AND image_analysis_id IS NOT NULL AND image_generation_id IS NULL AND humanization_id IS NULL) OR
    (type = 'humanization' AND humanization_id IS NOT NULL AND image_generation_id IS NULL AND image_analysis_id IS NULL)
);
