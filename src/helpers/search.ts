/**
 * MaterialDesignIcons-Picker
 * Search
 */
import {Icon} from '@/types';
import {intersect} from '@/helpers/array';

/**
 * Returns specified icon score according to current search expr.
 */
export const getWeight = (icon: Icon, searchVal: string, searchValWords: Array<string>): number => {
  // Exact name match
  if (icon.name === searchVal) {
    return 5;
  }

  // Matching words, keywords1 (name & aliases)
  if (searchVal.length > 1
    && intersect(searchValWords, icon.keywords1.split(' ')).length === searchValWords.length) {
    return 4;
  }

  // Simple substring on keywords1
  if (icon.keywords1.indexOf(searchVal) !== -1) {
    return 3;
  }

  // Matching words count, keywords2 (tags)
  if (searchVal.length > 1
    && icon.keywords2.length > 0
    && intersect(searchValWords, icon.keywords2.split(' ')).length === searchValWords.length) {
    return 2;
  }

  // Simple substring on keywords2
  if (icon.keywords2.indexOf(searchVal) !== -1) {
    return 1;
  }

  // Not a match!
  return 0;
}
