import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { socket, on } from "./lib/socket.js";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  Container,
  Title,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Card,
  Paper,
  Progress,
  RingProgress,
  Table,
  Badge,
  ScrollArea,
  Box,
  Grid,
  ThemeIcon,
  Alert,
  Modal,
  Code
} from "@mantine/core";
import { 
  IconArrowLeft, 
  IconDownload, 
  IconScan, 
  IconAlertCircle, 
  IconCheck, 
  IconSearch, 
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconDeviceFloppy,
  IconCodeAsterisk
} from "@tabler/icons-react";

const Watermark = () => (
  <div style={{
    position: 'absolute',
    bottom: '10px',
    right: '16px',
    fontSize: '12px',
    color: '#000000',
    opacity: '0.15',
    fontWeight: '600',
    pointerEvents: 'none',
  }}>
    ComplyScan
  </div>
);

export default function ScannerPage() {
  const [url, setUrl] = useState(""); 
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const mounted = useRef(false);

  const pushLog = useCallback((line) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev].slice(0, 500));
  }, []);

  useEffect(() => {
    mounted.current = true;
    const eventListeners = [
      on("scan_started", (d) => {
        if (!mounted.current) return;
        pushLog(`Scan started: ${d.url}`);
        setRunning(true);
        setProgress(5);
        setResult(null);
        setError("");
      }),
      on("log", (line) => {
        if (!mounted.current) return;
        pushLog(typeof line === "string" ? line : JSON.stringify(line));
      }),
      on("page_done", (d) => {
        if (!mounted.current) return;
        pushLog(`Page done: ${d.page} | cookies=${d.cookiesFound}, thirdParties=${d.thirdPartiesFound}`);
      }),
      on("progress", (p) => {
        if (!mounted.current) return;
        setProgress(Math.max(5, Math.min(100, Number(p.progress) || 0)));
      }),
      on("banner_detected", (b) => {
        if (!mounted.current) return;
        pushLog(`Banner detected on ${b.page} (visible=${b.visible ? "yes" : "no"})`);
      }),
      on("scan_result", (r) => {
        if (!mounted.current) return;
        setResult(r);
        setRunning(false);
        setProgress(100);
        pushLog("Scan finished.");
      }),
      on("scan_error", (e) => {
        if (!mounted.current) return;
        setError(e?.message || "Unknown error");
        setRunning(false);
        pushLog("Scan error: " + (e?.message || "Unknown error"));
      }),
      on("scan_done", () => {
        if (!mounted.current) return;
        setProgress((p) => (p < 95 ? 95 : p));
        pushLog("Scan processing complete.");
      }),
    ];
    return () => {
      mounted.current = false;
      eventListeners.forEach(off => off());
    };
  }, [pushLog]);

  function startScan() {
    setLogs([]);
    setResult(null);
    setError("");
    setProgress(0);
    setRunning(true);
    socket.emit("start_scan", { url }, (ack) => {
      if (!ack || ack.ok !== true) {
        setRunning(false);
        setError("Failed to start scan.");
      }
    });
  }

  function downloadJson() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `scan-${new URL(result.site).host}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Feature 1: Export PDF Report
  const exportPDF = async () => {
    if (!result) return;
    const element = document.getElementById("report-container");
    if (!element) return;
    
    try {
      pushLog("Generating PDF document...");
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ComplyScan-Report-${new URL(result.site).host}.pdf`);
      pushLog("PDF downloaded successfully.");
    } catch (e) {
      pushLog("PDF Generation failed: " + e.message);
    }
  };

  return (
    <Box 
      style={{ 
        background: "#f8f9fa", 
        minHeight: '100vh', 
        position: 'relative',
        paddingTop: "24px",
        paddingBottom: "64px" 
      }}
    >
      <Container size="xl">
        <Watermark />

        {/* Header */}
        <Stack align="center" mb={32}>
          <Button
            component={Link}
            to="/"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
            mb={-10}
          >
            Back to Home
          </Button>
          <Title order={1} fw={900} lts={-1} fz={40} style={{ color: "#1e293b" }}>
            ComplyScan
          </Title>
          <Text c="dimmed" size="lg" mt={-8}>
            Enter a URL to analyze its privacy compliance.
          </Text>
        </Stack>

        {/* Input Bar */}
        <Card withBorder radius="md" p="md" shadow="sm" mb="md">
          <Group align="flex-end" gap="sm">
            <TextInput
              placeholder="e.g., https://example.com"
              label="Target URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              flex={1}
              size="md"
              radius="md"
              leftSection={<IconScan size={18} opacity={0.5} />}
              onFocus={(e) => e.target.select()}
            />
            <Button
              onClick={startScan}
              disabled={running || !/^https?:\/\//i.test(url)}
              color="teal"
              size="md"
              radius="md"
              leftSection={running ? undefined : <IconScan size={18} />}
              loading={running}
            >
              {running ? "Scanning…" : "Scan Now"}
            </Button>
            
            {/* Action Group for Exports */}
            {result && (
              <Group gap="xs">
                 <Button
                  onClick={downloadJson}
                  variant="default"
                  size="md"
                  radius="md"
                  leftSection={<IconDeviceFloppy size={18} />}
                >
                  JSON
                </Button>
                <Button
                  onClick={exportPDF}
                  variant="gradient"
                  gradient={{ from: 'indigo', to: 'cyan' }}
                  size="md"
                  radius="md"
                  leftSection={<IconDownload size={18} />}
                >
                  Save PDF Report
                </Button>
              </Group>
            )}
          </Group>
        </Card>

        {/* Progress Bar */}
        <Box mb={24}>
          <Progress 
            value={progress} 
            size="lg" 
            radius="xl" 
            color="teal" 
            striped={running} 
            animated={running}
            transitionDuration={200}
          />
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Scan Failed" color="red" mb="lg">
            {error}
          </Alert>
        )}

        {/* Main Main Content Layout */}
        <Grid gutter="lg" align="flex-start">
          {/* Logs */}
          <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
            <Card withBorder shadow="sm" radius="md" p="md">
              <Title order={4} mb="sm" fw={700}>Live Logs</Title>
              <Paper 
                withBorder 
                bg="gray.0" 
                p="sm" 
                radius="sm" 
                h={result ? 600 : 400} 
                style={{ overflowY: "auto", transition: "height 0.3s ease" }}
              >
                <Stack gap={4}>
                  {logs.length > 0 ? (
                    logs.map((l, i) => (
                      <Text key={i} size="xs" ff="monospace" c="dimmed" style={{ wordBreak: "break-all" }}>
                        {l}
                      </Text>
                    ))
                  ) : (
                    <Text size="sm" c="dimmed" fs="italic">Logs will appear here...</Text>
                  )}
                </Stack>
              </Paper>
            </Card>
          </Grid.Col>

          {/* Results Area */}
          <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
            {!result ? (
              <Card 
                withBorder 
                shadow="sm" 
                radius="md" 
                p={40} 
                style={{ display: "grid", placeItems: "center", minHeight: 400 }}
              >
                <Stack align="center" gap="sm">
                  <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                    <IconScan size={32} />
                  </ThemeIcon>
                  <Text size="lg" c="dimmed" fw={500}>
                    {running ? "Analyzing site..." : "Run a scan to see the compliance report."}
                  </Text>
                </Stack>
              </Card>
            ) : (
              <Box id="report-container">
                <Stack gap="lg">
                  <ResultSummary result={result} />
                  <ViolationTips result={result} />
                  <CookiesSection cookies={Array.isArray(result.cookieReport) ? result.cookieReport : []} />
                </Stack>
              </Box>
            )}
          </Grid.Col>
        </Grid>

      </Container>
    </Box>
  );
}

// ----------------------------------------------------- //
// Sub-components
// ----------------------------------------------------- //

function ResultSummary({ result }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "teal";
    if (score >= 50) return "yellow";
    return "red";
  };
  const color = getScoreColor(result.score);
  
  // Feature 6: Categorized Trackers handling
  const getCategoryColor = (cat) => {
     switch(cat) {
        case "Analytics": return "blue";
        case "Advertising": return "pink";
        case "Marketing": return "orange";
        case "Social": return "indigo";
        case "Essential": return "gray";
        case "Media": return "red";
        default: return "dark";
     }
  }

  const trackers = result.categorizedTrackers || [];

  return (
    <Card withBorder radius="md" shadow="sm" p="lg">
      <Title order={3} fw={700} mb="md">Scan Summary</Title>
      
      <Group align="center" gap="xl">
        <RingProgress
          size={120}
          thickness={12}
          roundCaps
          sections={[{ value: result.score, color }]}
          label={
            <Text c={color} fw={700} ta="center" size="xl">
              {result.score}
            </Text>
          }
        />
        
        <Stack gap="xs" style={{ flex: 1 }}>
          <Group>
            <Text fw={600} w={120}>Target Site:</Text>
            <Text component="a" href={result.site} target="_blank" c="blue" fw={500}>
              {result.site}
            </Text>
          </Group>
          <Group>
            <Text fw={600} w={120}>Pages Scanned:</Text>
            <Badge size="lg" variant="light" color="blue">{result.scannedPages?.length ?? 0}</Badge>
          </Group>
          
          {/* Feature 2: Privacy Policy Display */}
          <Group>
            <Text fw={600} w={120}>Privacy Policy:</Text>
            {result.privacyPolicyFound ? (
              <Badge size="md" color={result.policyRealityCheck?.passed ? "teal" : "red"} variant="light">
                 {result.policyRealityCheck?.passed ? "Passed Reality Check" : "Incomplete (Missing Trackers)"}
              </Badge>
            ) : (
              <Badge size="md" color="red" variant="filled">Not Found</Badge>
            )}
          </Group>

          {/* Feature 6: Tracker Categorization Display */}
          <Group align="flex-start">
            <Text fw={600} w={120}>3rd-Party Hosts:</Text>
            <ScrollArea h={65} style={{ flex: 1 }}>
              {trackers.length > 0 ? (
                <Group gap="xs">
                   {trackers.map((t, i) => (
                      <Badge key={i} color={getCategoryColor(t.category)} variant="light" size="sm" title={t.url}>
                         {t.category}: {t.name}
                      </Badge>
                   ))}
                </Group>
              ) : (
                 <Text size="sm" c="dimmed">None detected</Text>
              )}
            </ScrollArea>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}

function ViolationTips({ result }) {
  const [cmpModalOpen, setCmpModalOpen] = useState(false);
  
  // Feature 3: Actionable Fixes Check
  const needsBanner = !result.consentBannerDetected && (result.thirdPartyRequests?.length > 0 || result.cookies?.length > 0);

  return (
    <>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" shadow="sm" p="lg" h="100%">
            <Group gap="xs" mb="md">
              <ThemeIcon color="red" variant="light" radius="xl" size="md">
                <IconAlertCircle size={18} />
              </ThemeIcon>
              <Title order={4} fw={700} c="red.7">Violations Detected</Title>
            </Group>
            <Stack gap="sm">
              {result.violations?.length ? (
                result.violations.map((v, i) => (
                  <Alert key={i} variant="light" color="red" p="xs" radius="md">
                    <Text size="sm">{v}</Text>
                  </Alert>
                ))
              ) : (
                <Text size="sm" c="dimmed">No violations detected!</Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" shadow="sm" p="lg" h="100%">
            <Group gap="xs" mb="md">
              <ThemeIcon color="teal" variant="light" radius="xl" size="md">
                <IconCheck size={18} />
              </ThemeIcon>
              <Title order={4} fw={700} c="teal.7">Recommendations</Title>
            </Group>
            <Stack gap="sm">
              {result.tips?.length ? (
                result.tips.map((t, i) => (
                  <Alert key={i} variant="light" color="teal" p="xs" radius="md">
                    <Text size="sm">{t}</Text>
                  </Alert>
                ))
              ) : (
                <Text size="sm" c="dimmed">No specific tips available.</Text>
              )}
              
              {/* Feature 3: CMP Snippet CTA */}
              {needsBanner && (
                  <Button 
                    variant="light" 
                    color="indigo" 
                    leftSection={<IconCodeAsterisk size={16}/>} 
                    onClick={() => setCmpModalOpen(true)}
                    mt="sm"
                  >
                    View Banner Solutions
                  </Button>
              )}

            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
      
      {/* Feature 3: CMP Snippets Modal */}
      <Modal opened={cmpModalOpen} onClose={() => setCmpModalOpen(false)} title="Consent Banner Fixes" size="lg" centered>
         <Text size="sm" mb="md">
            Your site is loading trackers before obtaining user consent. To fix this, you must implement a Consent Management Platform (CMP).
         </Text>
         
         <Title order={5} mb="xs">Option 1: Klaro (Free & Open Source)</Title>
         <Text size="sm" c="dimmed" mb="xs">Add this inside your {"<head>"} tag to install a free, highly-customizable banner.</Text>
         <Code block copyLabel="Copy" copiedLabel="Copied!">
{`<!-- Klaro Consent Manager -->
<script defer type="text/javascript" src="https://cdn.kiprotect.com/klaro/v0.7/klaro.js"></script>
`}
         </Code>
         
         <Title order={5} mt="lg" mb="xs">Option 2: Cookiebot (Enterprise / Paid)</Title>
         <Text size="sm" c="dimmed" mb="xs">A widely adapted standard. Replace the data-cbid with your own.</Text>
         <Code block copyLabel="Copy" copiedLabel="Copied!">
{`<!-- Cookiebot CMP -->
<script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="00000000-0000-0000-0000-000000000000" type="text/javascript" async></script>
`}
         </Code>
         
         <Alert title="Important Setup Step" color="yellow" mt="lg">
            Remember: Just installing the banner is not enough. You must update your existing analytics scripts to wait for consent (e.g. changing <code>type="text/javascript"</code> to <code>type="text/plain" data-type="application/javascript"</code> depending on your CMP).
         </Alert>
      </Modal>
    </>
  );
}

function CookiesSection({ cookies }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "lifetimeDays", dir: "desc" });
  const pageSize = 10;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = cookies;
    if (query) {
      list = cookies.filter((r) =>
        Object.values(r).some(val => String(val).toLowerCase().includes(query))
      );
    }
    const { key, dir } = sort;
    const sgn = dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const A = a[key]; const B = b[key];
      if (typeof A === "number" && typeof B === "number") return sgn * (A - B);
      return sgn * String(A ?? "").localeCompare(String(B ?? ""));
    });
  }, [cookies, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);

  useEffect(() => { setPage(1); }, [q, sort.key, sort.dir]);

  const handleSort = (key) => {
    setSort(s => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  const getSortIcon = (key) => {
    if (sort.key !== key) return <IconSelector size={14} style={{ opacity: 0.3 }} />;
    return sort.dir === "asc" ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />;
  };

  const Th = ({ label, sortKey }) => (
    <Table.Th 
      onClick={() => handleSort(sortKey)} 
      style={{ cursor: "pointer", whiteSpace: "nowrap" }}
    >
      <Group gap="xs" justify="space-between">
        <Text fw={600} size="sm">{label}</Text>
        {getSortIcon(sortKey)}
      </Group>
    </Table.Th>
  );

  return (
    <Card withBorder radius="md" shadow="sm" p="lg">
      <Group justify="space-between" mb="md">
        <Group>
          <Title order={3} fw={700}>Cookies</Title>
          <Badge size="lg" color="gray" variant="light">{cookies.length}</Badge>
        </Group>
        <TextInput
          placeholder="Search cookies..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leftSection={<IconSearch size={16} />}
          radius="md"
          w={{ base: "100%", sm: 250 }}
        />
      </Group>

      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover verticalSpacing="sm" withTableBorder withColumnBorders>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Th label="Name" sortKey="name" />
              <Th label="Domain" sortKey="domain" />
              <Th label="Type" sortKey="firstParty" />
              <Th label="Purpose" sortKey="purpose" />
              <Th label="Expires" sortKey="expiresAt" />
              <Th label="Lifetime (Days)" sortKey="lifetimeDays" />
              <Th label="Secure" sortKey="secure" />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pageRows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7} ta="center" py="xl" c="dimmed">
                  No cookies found matching criteria.
                </Table.Td>
              </Table.Tr>
            ) : (
              pageRows.map((c, i) => (
                <Table.Tr key={i}>
                  <Table.Td><Text size="sm" ff="monospace" fw={600}>{c.name}</Text></Table.Td>
                  <Table.Td><Text size="sm">{c.domain}</Text></Table.Td>
                  <Table.Td>
                    <Badge variant={c.firstParty ? "light" : "outline"} color={c.firstParty ? "teal" : "orange"} size="sm">
                      {c.firstParty ? "1st-Party" : "3rd-Party"}
                    </Badge>
                  </Table.Td>
                  <Table.Td><Text size="sm" c={!c.purpose ? "dimmed" : "text"}>{c.purpose || "Unknown"}</Text></Table.Td>
                  <Table.Td><Text size="sm">{c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "Session"}</Text></Table.Td>
                  <Table.Td><Text size="sm">{c.lifetimeDays ?? "-"}</Text></Table.Td>
                  <Table.Td>
                    {c.secure ? 
                      <Badge color="teal" variant="dot">Yes</Badge> : 
                      <Badge color="red" variant="dot">No</Badge>
                    }
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {totalPages > 1 && (
        <Group justify="space-between" mt="md">
          <Text size="sm" c="dimmed">
            Page {page} of {totalPages}
          </Text>
          <Group gap="xs">
            <Button variant="default" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
              Prev
            </Button>
            <Button variant="default" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
              Next
            </Button>
          </Group>
        </Group>
      )}
    </Card>
  );
}