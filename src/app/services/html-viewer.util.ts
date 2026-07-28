export function isHtmlViewerType(type?: string): boolean {
  const normalized = (type || '').toLowerCase();
  return normalized === 'htmlviewer' || normalized === 'dsw.addons.htmlviewer';
}

export interface IHtmlViewerContext {
  filters?: string;
  widgetData?: unknown;
}

export function buildHtmlViewerMarkup(data?: string, context: string | IHtmlViewerContext = ''): string {
  const normalizedContext = normalizeContext(context);
  const source = resolveHtmlViewerSource(data || '', normalizedContext);
  const trimmed = source.trim();
  if (!trimmed) {
    return '';
  }
  const renderable = parseRenderableSource(trimmed);
  if (renderable?.type === 'html') {
    return renderable.value;
  }
  if (renderable?.type === 'url') {
    return `<iframe src="${escapeHtmlAttribute(renderable.value)}" style="display:block;border:none;width:100%;height:100%;min-height:100%"></iframe>`;
  }
  return source;
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizeContext(context: string | IHtmlViewerContext): IHtmlViewerContext {
  if (typeof context === 'string') {
    return {filters: context};
  }
  return context || {};
}

function resolveHtmlViewerSource(source: string, context: IHtmlViewerContext): string {
  const prepared = applyHtmlViewerPlaceholders(source, context);
  if (prepared.trim()) {
    return prepared;
  }
  // Linked mode reuses tuple members from the source widget when htmlViewer has no own Data payload.
  const linkedWidgetSource = extractLinkedWidgetSource(context.widgetData);
  if (linkedWidgetSource) {
    return linkedWidgetSource;
  }
  return extractRenderableString(context.widgetData);
}

function applyHtmlViewerPlaceholders(source: string, context: IHtmlViewerContext): string {
  const filters = context.filters || '';
  const widgetDataJson = stringifyWidgetData(context.widgetData);

  return source
    .replace(/\$\$\$FILTERS/g, encodeURIComponent(filters))
    .replace(/\$\$\$FILTERS_RAW/g, filters)
    .replace(/\$\$\$WIDGET_DATA_JSON/g, widgetDataJson)
    .replace(/\$\$\$WIDGET_DATA_ENCODED/g, encodeURIComponent(widgetDataJson));
}

function stringifyWidgetData(widgetData: unknown): string {
  if (widgetData === undefined) {
    return '';
  }

  try {
    return JSON.stringify(widgetData, null, 2);
  } catch {
    return '';
  }
}

function extractRenderableString(widgetData: unknown): string {
  const candidates: string[] = [];
  const seen = new Set<unknown>();
  collectStringCandidates(widgetData, candidates, seen);

  for (const candidate of candidates) {
    const renderable = parseRenderableSource(candidate);
    if (renderable) {
      return renderable.value;
    }
  }

  return '';
}

function collectStringCandidates(value: unknown, candidates: string[], seen: Set<unknown>) {
  if (value === null || value === undefined) {
    return;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      candidates.push(trimmed);
    }
    return;
  }
  if (typeof value !== 'object') {
    return;
  }
  if (seen.has(value)) {
    return;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach(item => collectStringCandidates(item, candidates, seen));
    return;
  }

  Object.values(value).forEach(item => collectStringCandidates(item, candidates, seen));
}

function isHtmlCandidate(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

function isUrlCandidate(value: string): boolean {
  return /^(https?:\/\/|data:|\/csp\/|csp\/)/i.test(value);
}

function parseRenderableSource(value: string): { type: 'html' | 'url'; value: string } | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  // [url] is an explicit override for values that should be rendered in an iframe even if they do not look like HTML.
  const urlMarkerMatch = trimmed.match(/^\[url]\s*(.+)$/i);
  if (urlMarkerMatch?.[1]?.trim()) {
    return {
      type: 'url',
      value: urlMarkerMatch[1].trim()
    };
  }

  if (isHtmlCandidate(trimmed)) {
    return {
      type: 'html',
      value: trimmed
    };
  }

  if (isUrlCandidate(trimmed)) {
    return {
      type: 'url',
      value: trimmed
    };
  }

  return null;
}

function extractLinkedWidgetSource(widgetData: unknown): string {
  const members = extractTupleMembers(widgetData);
  for (const member of members) {
    const renderable = parseRenderableSource(member);
    if (renderable) {
      return renderable.value;
    }
  }

  return '';
}

function extractTupleMembers(widgetData: unknown): string[] {
  if (!widgetData || typeof widgetData !== 'object') {
    return [];
  }

  const cols = (widgetData as {Cols?: unknown[]}).Cols;
  if (!Array.isArray(cols)) {
    return [];
  }

  const members: string[] = [];
  cols.forEach((axis, axisIndex) => {
    if (!axis || typeof axis !== 'object') {
      return;
    }
    const tuples = (axis as {tuples?: unknown[]}).tuples;
    if (!Array.isArray(tuples)) {
      return;
    }
    tuples.forEach(tuple => {
      if (!tuple || typeof tuple !== 'object') {
        return;
      }
      const typedTuple = tuple as {caption?: unknown; dimension?: unknown; path?: unknown; title?: unknown; type?: unknown};
      if (axisIndex > 0 && typedTuple.type !== 'msr') {
        pushCandidate(members, typedTuple.caption);
        pushCandidate(members, typedTuple.dimension);
        pushCandidate(members, unwrapPathMember(typedTuple.path));
        pushCandidate(members, typedTuple.title);
        return;
      }

      pushCandidate(members, typedTuple.caption);
      pushCandidate(members, typedTuple.dimension);
      pushCandidate(members, unwrapPathMember(typedTuple.path));
      pushCandidate(members, typedTuple.title);
    });
  });

  return members;
}

function pushCandidate(target: string[], value: unknown) {
  if (typeof value !== 'string') {
    return;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }
  if (!target.includes(trimmed)) {
    target.push(trimmed);
  }
}

function unwrapPathMember(path: unknown): string {
  if (typeof path !== 'string') {
    return '';
  }
  const match = path.match(/&\[(.*)]$/);
  return match?.[1]?.trim() || '';
}
