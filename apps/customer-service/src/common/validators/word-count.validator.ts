import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'wordCount', async: false })
export class WordCountValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!text) return true; // Skip validation if text is empty (handled by @IsOptional)

    const [minWords, maxWords] = args.constraints;
    const wordCount = text.trim().split(/\s+/).length;

    return wordCount >= minWords && wordCount <= maxWords;
  }

  defaultMessage(args: ValidationArguments) {
    const [minWords, maxWords] = args.constraints;
    return `Bio must be between ${minWords} and ${maxWords} words`;
  }
}
