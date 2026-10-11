import {
  Button,
  Checkbox,
  DateRangePicker,
  Dropdown,
  Label,
  RangeCalendar,
  SearchField,
} from "@heroui/react";
import { Funnel } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateValue, RangeValue } from "@heroui/react";
import { wikiAuthors } from "../content/wiki";

export interface WikiFilterDropdownProps {
  dateRange: RangeValue<DateValue> | null;
  onDateRangeChange: (value: RangeValue<DateValue> | null) => void;
  authorKeys: string[];
  onAuthorKeysChange: (keys: string[]) => void;
  /** 筛选按钮尺寸，主内容区的「变大版」用 lg。 */
  buttonSize?: "md" | "lg";
}

function WikiFilterDropdown({
  dateRange,
  onDateRangeChange,
  authorKeys,
  onAuthorKeysChange,
  buttonSize = "md",
}: WikiFilterDropdownProps) {
  const [authorQuery, setAuthorQuery] = useState("");

  const filteredAuthors = useMemo(() => {
    const query = authorQuery.trim().toLowerCase();
    if (!query) return wikiAuthors;
    return wikiAuthors.filter(
      (author) =>
        author.name.toLowerCase().includes(query) || author.id.toLowerCase().includes(query),
    );
  }, [authorQuery]);

  const toggleAuthor = (id: string, isSelected: boolean) => {
    onAuthorKeysChange(isSelected ? [...authorKeys, id] : authorKeys.filter((key) => key !== id));
  };

  return (
    <Dropdown>
      {/* Dropdown 会把第一个子元素当作触发器，直接放 Button 即可，
                再套一层 Dropdown.Trigger 会渲染出嵌套的 <button>。 */}
      <Button variant="tertiary" size={buttonSize}>
        <Funnel />
        筛选
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu aria-label="Wiki 过滤条件">
          <Dropdown.SubmenuTrigger>
            <Dropdown.Item>
              <Label>修改日期</Label>
              <Dropdown.SubmenuIndicator />
            </Dropdown.Item>
            <Dropdown.Popover>
              <DateRangePicker
                aria-label="修改日期"
                className="w-[320px] p-3"
                value={dateRange}
                onChange={onDateRangeChange}
              >
                <RangeCalendar aria-label="修改日期">
                  <RangeCalendar.Header>
                    <RangeCalendar.YearPickerTrigger>
                      <RangeCalendar.YearPickerTriggerHeading />
                      <RangeCalendar.YearPickerTriggerIndicator />
                    </RangeCalendar.YearPickerTrigger>
                    <RangeCalendar.NavButton slot="previous" />
                    <RangeCalendar.NavButton slot="next" />
                  </RangeCalendar.Header>
                  <RangeCalendar.Grid>
                    <RangeCalendar.GridHeader>
                      {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
                    </RangeCalendar.GridHeader>
                    <RangeCalendar.GridBody>
                      {(date) => <RangeCalendar.Cell date={date} />}
                    </RangeCalendar.GridBody>
                  </RangeCalendar.Grid>
                  <RangeCalendar.YearPickerGrid>
                    <RangeCalendar.YearPickerGridBody>
                      {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
                    </RangeCalendar.YearPickerGridBody>
                  </RangeCalendar.YearPickerGrid>
                </RangeCalendar>
              </DateRangePicker>
            </Dropdown.Popover>
          </Dropdown.SubmenuTrigger>

          <Dropdown.SubmenuTrigger>
            <Dropdown.Item>
              <Label>作者</Label>
              <Dropdown.SubmenuIndicator />
            </Dropdown.Item>
            <Dropdown.Popover>
              <div className="w-[260px] p-2">
                <SearchField
                  aria-label="搜索作者"
                  value={authorQuery}
                  onChange={setAuthorQuery}
                  variant="secondary"
                >
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="搜索作者…" />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
                {/* 自行维护选中状态：ListBox 会在选项被搜索过滤掉或弹层卸载时
                                    丢弃不在集合中的已选项。 */}
                <div role="group" aria-label="作者" className="mt-2 max-h-60 overflow-y-auto">
                  {filteredAuthors.map((author) => (
                    <Checkbox
                      key={author.id}
                      className="w-full px-2 py-1.5"
                      isSelected={authorKeys.includes(author.id)}
                      onChange={(isSelected) => toggleAuthor(author.id, isSelected)}
                    >
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        {author.name}
                      </Checkbox.Content>
                    </Checkbox>
                  ))}
                </div>
              </div>
            </Dropdown.Popover>
          </Dropdown.SubmenuTrigger>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

export default WikiFilterDropdown;
